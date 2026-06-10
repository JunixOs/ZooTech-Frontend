import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { getDepartments, getDistricts, getProvinces } from 'geo-peru';

import {
  AdquisicionPor,
  AptoPara,
  RegistrarVacunoRequest,
  SexoVacuno,
} from '../../domain/models/vacuno.model';
import { UbigeoOption, VacunosApiService } from '../../infrastructure/vacunos.api.service';

export function soloMayusculas(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  return !value || /^[A-Z0-9]+$/.test(value) ? null : { soloMayusculas: true };
}

export function observacionesValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';

  if (!value) {
    return null;
  }

  if (value.length > 150) {
    return { maxCaracteres: true };
  }

  if (value.trim().split(/\s+/).filter(Boolean).length > 30) {
    return { maxPalabras: true };
  }

  return null;
}

type LocationCatalog = Record<string, Record<string, string[]>>;
type LocationCodes = {
  departamentos: Record<string, string>;
  provincias: Record<string, Record<string, string>>;
  distritos: Record<string, Record<string, Record<string, string>>>;
};

@Component({
  selector: 'zt-vacuno-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './vacuno-form.component.html',
  styleUrl: './vacuno-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(VacunosApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly guardando = signal(false);
  readonly cargando = signal(false);
  readonly editando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly erroresCampo = signal<Record<string, string>>({});
  readonly fotoPreview = signal<string | null>(null);
  readonly fotoNombre = signal<string | null>(null);
  readonly esCompra = signal(false);
  readonly ubigeoOptions = signal<UbigeoOption[]>(this.buildPeruUbigeoOptions());
  readonly departamentoSeleccionado = signal('');
  readonly provinciaSeleccionada = signal('');

  private archivoFoto: File | null = null;
  private codigoOriginal: string | null = null;

  readonly opcionesRaza = [
    'Jersey',
    'Holstein',
    'Angus',
    'Hereford',
    'Simmental',
    'Brown Swiss',
    'Brahman',
    'Charolais',
  ];
  readonly locationCatalog = computed(() => this.toLocationCatalog(this.ubigeoOptions()));
  readonly locationCodes = computed(() => this.toLocationCodes(this.ubigeoOptions()));
  readonly opcionesDepartamento = computed(() =>
    this.withCurrentOption(Object.keys(this.locationCatalog()), this.departamentoSeleccionado()),
  );
  readonly opcionesProvincia = computed(() =>
    this.withCurrentOption(
      this.getProvinciaOptions(this.departamentoSeleccionado()),
      this.provinciaSeleccionada(),
    ),
  );
  readonly opcionesDistrito = computed(() =>
    this.withCurrentOption(
      this.getDistritoOptions(this.departamentoSeleccionado(), this.provinciaSeleccionada()),
      this.form.controls.distrito.value ?? '',
    ),
  );

  readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(10), soloMayusculas]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    fechaNacimiento: ['', Validators.required],
    adquisicionPor: ['monta' as AdquisicionPor, Validators.required],
    precioCompra: [null as number | null],
    raza: ['Jersey', Validators.required],
    color: ['', [Validators.required, Validators.maxLength(30)]],
    sexo: ['hembra' as SexoVacuno, Validators.required],
    codigoPadre: ['', [Validators.required, Validators.maxLength(10), soloMayusculas]],
    codigoMadre: ['', [Validators.required, Validators.maxLength(10), soloMayusculas]],
    granja: ['', [Validators.required, Validators.maxLength(100)]],
    departamento: ['', [Validators.required, Validators.maxLength(60)]],
    provincia: ['', [Validators.required, Validators.maxLength(60)]],
    distrito: ['', [Validators.required, Validators.maxLength(60)]],
    aptoPara: ['produccion_leche' as AptoPara, Validators.required],
    fechaEspecificacion: ['', Validators.required],
    observaciones: ['', observacionesValidator],
  });

  constructor() {
    this.form.controls.adquisicionPor.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => {
        const precio = this.form.controls.precioCompra;
        const compra = tipo === 'compra';

        this.esCompra.set(compra);

        if (compra && !this.editando()) {
          precio.setValidators([Validators.required, Validators.min(0.01)]);
        } else {
          precio.clearValidators();
          precio.setValue(null);
        }

        precio.updateValueAndValidity();
      });
  }

  ngOnInit(): void {
    this.cargarOpciones();

    const codigo = this.route.snapshot.paramMap.get('codigo');

    if (!codigo) {
      return;
    }

    this.editando.set(true);
    this.codigoOriginal = codigo;
    this.configurarModoEdicion();
    this.cargarVacuno(codigo);
  }

  onArchivoSeleccionado(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      this.erroresCampo.update((errors) => ({ ...errors, foto: this.translate.instant('vacunos.form.errors.soloImagenes') }));
      return;
    }

    this.archivoFoto = file;
    this.fotoNombre.set(file.name);
    this.erroresCampo.update((errors) => {
      const copy = { ...errors };
      delete copy['foto'];
      return copy;
    });

    const reader = new FileReader();
    reader.onload = () => this.fotoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  quitarFoto(): void {
    this.archivoFoto = null;
    this.fotoPreview.set(null);
    this.fotoNombre.set(null);
  }

  guardar(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    const payload: RegistrarVacunoRequest = {
      codigo: raw.codigo!,
      nombre: raw.nombre!,
      fechaNacimiento: raw.fechaNacimiento!,
      adquisicionPor: raw.adquisicionPor!,
      raza: raw.raza!,
      color: raw.color!,
      sexo: raw.sexo!,
      codigoPadre: raw.codigoPadre!,
      codigoMadre: raw.codigoMadre!,
      granja: raw.granja!,
      distrito: raw.distrito!,
      departamento: raw.departamento!,
      provincia: raw.provincia!,
      aptoPara: raw.aptoPara!,
      fechaEspecificacion: raw.fechaEspecificacion!,
      precioCompra: raw.adquisicionPor === 'compra' ? Number(raw.precioCompra) : null,
      observaciones: raw.observaciones?.trim() || undefined,
      foto: this.archivoFoto,
      ...this.getUbigeoCodes({
        departamento: raw.departamento!,
        provincia: raw.provincia!,
        distrito: raw.distrito!,
      }),
    };

    this.guardando.set(true);
    this.errorServidor.set(null);
    this.erroresCampo.set({});

    if (this.editando()) {
      const codigo = this.codigoOriginal ?? payload.codigo;

      this.api
        .actualizarVacuno(codigo, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated) => {
            this.guardando.set(false);
            void this.router.navigate(['/vacunos/listado'], {
              queryParams: { updated: updated.codigo ?? codigo },
            });
          },
          error: (error) => this.handleError(error),
        });
      return;
    }

    this.api
      .registrarVacuno(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardando.set(false);
          void this.router.navigate(['/vacunos/listado']);
        },
        error: (error) => this.handleError(error),
      });
  }

  cancelar(): void {
    void this.router.navigate(['/vacunos/listado']);
  }

  campoInvalido(name: string): boolean {
    const control = this.form.get(name);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  mensajeError(name: string): string {
    const serverMessage = this.erroresCampo()[name];

    if (serverMessage) {
      return serverMessage;
    }

    const errors = this.form.get(name)?.errors;

    if (!errors) {
      return '';
    }

    if (errors['required']) return this.translate.instant('vacunos.form.errors.campoObligatorio');
    if (errors['maxlength']) return this.translate.instant('vacunos.form.errors.maxCaracteres', { count: errors['maxlength'].requiredLength });
    if (errors['soloMayusculas']) return this.translate.instant('vacunos.form.errors.soloMayusculas');
    if (errors['min']) return this.translate.instant('vacunos.form.errors.minValor');
    if (errors['maxCaracteres']) return this.translate.instant('vacunos.form.errors.maxCaracteres', { count: 150 });
    if (errors['maxPalabras']) return this.translate.instant('vacunos.form.errors.maxPalabras');

    return this.translate.instant('vacunos.form.errors.valorInvalido');
  }

  forzarMayusculas(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.form.get(field)?.setValue(upper, { emitEvent: false });
    input.value = upper;
  }

  soloNumerosDecimales(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (allowed.includes(event.key)) {
      return;
    }

    if (!/^[0-9.]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.key === '.' && (event.target as HTMLInputElement).value.includes('.')) {
      event.preventDefault();
    }
  }

  onDepartamentoChange(value: string): void {
    this.departamentoSeleccionado.set(value);
    this.provinciaSeleccionada.set('');
    this.form.patchValue(
      {
        provincia: '',
        distrito: '',
      },
      { emitEvent: false },
    );
  }

  onProvinciaChange(value: string): void {
    this.provinciaSeleccionada.set(value);
    this.form.patchValue({ distrito: '' }, { emitEvent: false });
  }

  private configurarModoEdicion(): void {
    this.form.controls.codigo.disable({ emitEvent: false });
    this.form.controls.fechaNacimiento.disable({ emitEvent: false });
    this.form.controls.codigoPadre.disable({ emitEvent: false });
    this.form.controls.codigoMadre.disable({ emitEvent: false });

    const optionalOnEdit = [
      this.form.controls.codigoPadre,
      this.form.controls.codigoMadre,
      this.form.controls.departamento,
      this.form.controls.provincia,
      this.form.controls.distrito,
      this.form.controls.aptoPara,
    ];

    for (const control of optionalOnEdit) {
      control.clearValidators();
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private cargarOpciones(): void {
    this.api
      .obtenerOpciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (options) => {
          if (options.ubigeoOptions?.length && this.isCompleteUbigeoCatalog(options.ubigeoOptions)) {
            this.ubigeoOptions.set(options.ubigeoOptions);
          }
        },
      });
  }

  private cargarVacuno(codigo: string): void {
    this.cargando.set(true);
    this.errorServidor.set(null);

    this.api
      .obtenerVacuno(codigo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (vacuno) => {
          this.cargando.set(false);
          this.form.patchValue({
            codigo: vacuno.codigo,
            nombre: vacuno.nombre,
            fechaNacimiento: vacuno.fechaNacimiento,
            adquisicionPor: this.normalizarAdquisicion(vacuno.adquisicionPor),
            raza: vacuno.raza || 'Jersey',
            color: vacuno.color ?? '',
            sexo: this.normalizarSexo(vacuno.sexo),
            codigoPadre: vacuno.codigoPadre ?? '',
            codigoMadre: vacuno.codigoMadre ?? '',
            granja: vacuno.granja ?? '',
            distrito: vacuno.distrito ?? '',
            departamento: vacuno.departamento ?? '',
            provincia: vacuno.provincia ?? '',
            aptoPara: this.normalizarAptoPara(vacuno.aptoPara),
            fechaEspecificacion:
              vacuno.fechaRegistroFuncion ?? vacuno.fechaRegistroEspecializacion ?? vacuno.fechaNacimiento,
            observaciones: vacuno.observaciones ?? '',
          });
          this.departamentoSeleccionado.set(vacuno.departamento ?? '');
          this.provinciaSeleccionada.set(vacuno.provincia ?? '');
        },
        error: () => {
          this.cargando.set(false);
          this.errorServidor.set(this.translate.instant('vacunos.form.errors.cargaFallida'));
        },
      });
  }

  private normalizarAdquisicion(value: string | undefined): AdquisicionPor {
    return String(value ?? '').toLowerCase() === 'compra' ? 'compra' : 'monta';
  }

  private normalizarSexo(value: string | undefined): SexoVacuno {
    return String(value ?? '').toLowerCase() === 'macho' ? 'macho' : 'hembra';
  }

  private normalizarAptoPara(value: string | undefined): AptoPara {
    const normalized = String(value ?? '').toLowerCase();

    if (normalized === 'carne' || normalized === 'reproduccion') {
      return normalized;
    }

    return 'produccion_leche';
  }

  private handleError(error: unknown): void {
    this.guardando.set(false);

    const responseError = (error as { error?: { error?: ApiErrorBody; message?: string } })?.error;
    const apiError = responseError?.error;

    if (!apiError) {
      this.errorServidor.set(responseError?.message ?? this.translate.instant('vacunos.form.errors.errorInesperado'));
      return;
    }

    if (apiError.code === 'VACUNO_ALREADY_EXISTS') {
      this.erroresCampo.set({ codigo: apiError.message });
      return;
    }

    if (apiError.code === 'VALIDATION_ERROR' && apiError.details?.length) {
      const mapped: Record<string, string> = {};

      for (const detail of apiError.details) {
        mapped[this.mapCampo(detail.field)] = detail.message;
      }

      this.erroresCampo.set(mapped);
      return;
    }

    this.errorServidor.set(apiError.message || this.translate.instant('vacunos.form.errors.errorServidor'));
  }

  private mapCampo(field: string): string {
    const map: Record<string, string> = {
      Codigo: 'codigo',
      Nombre: 'nombre',
      FechaNacimiento: 'fechaNacimiento',
      AdquisicionPor: 'adquisicionPor',
      PrecioCompra: 'precioCompra',
      Raza: 'raza',
      Color: 'color',
      Sexo: 'sexo',
      CodigoPadre: 'codigoPadre',
      CodigoMadre: 'codigoMadre',
      Granja: 'granja',
      Distrito: 'distrito',
      Departamento: 'departamento',
      Provincia: 'provincia',
      AptoPara: 'aptoPara',
      FechaEspecificacion: 'fechaEspecificacion',
      Observaciones: 'observaciones',
      Foto: 'foto',
    };

    return map[field] ?? field.charAt(0).toLowerCase() + field.slice(1);
  }

  private getUbigeoCodes(
    value: Pick<RegistrarVacunoRequest, 'departamento' | 'provincia' | 'distrito'>,
  ): Pick<RegistrarVacunoRequest, 'codigoDepartamento' | 'codigoProvincia' | 'codigoDistrito'> {
    const codes = this.locationCodes();

    return {
      codigoDepartamento: codes.departamentos[value.departamento],
      codigoProvincia: codes.provincias[value.departamento]?.[value.provincia],
      codigoDistrito: codes.distritos[value.departamento]?.[value.provincia]?.[value.distrito],
    };
  }

  private getProvinciaOptions(departamento: string | undefined): string[] {
    const catalog = this.locationCatalog();

    if (departamento && catalog[departamento]) {
      return Object.keys(catalog[departamento]);
    }

    return [];
  }

  private getDistritoOptions(departamento: string | undefined, provincia: string | undefined): string[] {
    const catalog = this.locationCatalog();

    if (departamento && provincia && catalog[departamento]?.[provincia]) {
      return catalog[departamento][provincia];
    }

    return [];
  }

  private buildPeruUbigeoOptions(): UbigeoOption[] {
    return getDepartments().map((departamento) => ({
      codigo: departamento.code,
      nombre: departamento.name,
      hijos: getProvinces(departamento.code).map((provincia) => ({
        codigo: provincia.code,
        nombre: provincia.name,
        hijos: getDistricts(provincia.code).map((distrito) => ({
          codigo: distrito.ubigeo,
          nombre: distrito.name,
          hijos: [],
        })),
      })),
    }));
  }

  private isCompleteUbigeoCatalog(ubigeoOptions: UbigeoOption[]): boolean {
    return ubigeoOptions.length >= this.ubigeoOptions().length;
  }

  private toLocationCatalog(ubigeoOptions: UbigeoOption[]): LocationCatalog {
    return ubigeoOptions.reduce<LocationCatalog>((catalog, departamento) => {
      catalog[departamento.nombre] = departamento.hijos.reduce<Record<string, string[]>>(
        (provincias, provincia) => {
          provincias[provincia.nombre] = provincia.hijos.map((distrito) => distrito.nombre);
          return provincias;
        },
        {},
      );

      return catalog;
    }, {});
  }

  private toLocationCodes(ubigeoOptions: UbigeoOption[]): LocationCodes {
    return ubigeoOptions.reduce<LocationCodes>(
      (codes, departamento) => {
        codes.departamentos[departamento.nombre] = departamento.codigo;
        codes.provincias[departamento.nombre] = {};
        codes.distritos[departamento.nombre] = {};

        departamento.hijos.forEach((provincia) => {
          codes.provincias[departamento.nombre][provincia.nombre] = provincia.codigo;
          codes.distritos[departamento.nombre][provincia.nombre] = {};

          provincia.hijos.forEach((distrito) => {
            codes.distritos[departamento.nombre][provincia.nombre][distrito.nombre] = distrito.codigo;
          });
        });

        return codes;
      },
      { departamentos: {}, provincias: {}, distritos: {} },
    );
  }

  private withCurrentOption(options: string[], current: string | undefined): string[] {
    return current && !options.includes(current) ? [current, ...options] : options;
  }
}

interface ApiErrorBody {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
