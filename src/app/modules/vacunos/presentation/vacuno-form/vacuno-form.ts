import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { startWith } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { BackButtonComponent } from '@shared/components/back-button/back-button';

import {
  AdquisicionPor,
  AptoPara,
  RegistrarVacunoRequest,
  SexoVacuno,
} from '../../domain/models/vacuno.model';
import { GranjaOption, VacunoReferenceOption } from '../../application/dtos/vacunos.dtos';
import { VacunosFacade } from '../../application/facades/vacunos.facade';

export function soloNumeros(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  return !value || /^[0-9]+$/.test(value) ? null : { soloNumeros: true };
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



@Component({
  selector: 'zt-vacuno-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, PageHeaderComponent, BackButtonComponent],
  templateUrl: './vacuno-form.html',
  styleUrl: './vacuno-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(VacunosFacade);
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
  readonly granjas = signal<GranjaOption[]>([]);
  readonly cargandoGranjas = signal(false);
  readonly referencias = signal<VacunoReferenceOption[]>([]);
  readonly cargandoReferencias = signal(false);

  private archivoFoto: File | null = null;
  private codigoOriginal: string | null = null;

  readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(7), soloNumeros]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    fechaNacimiento: ['', Validators.required],
    adquisicionPor: ['NACIMIENTO' as AdquisicionPor, Validators.required],
    precioCompra: [null as number | null],
    raza: ['JERSEY', Validators.required],
    color: ['', [Validators.required, Validators.maxLength(30)]],
    sexo: ['HEMBRA' as SexoVacuno, Validators.required],
    codigoPadre: ['', [Validators.required, Validators.maxLength(10)]],
    codigoMadre: ['', [Validators.required, Validators.maxLength(10)]],
    granjaId: [null as number | null, Validators.required],
    aptoPara: ['LECHE' as AptoPara, Validators.required],
    fechaEspecificacion: ['', Validators.required],
    observaciones: ['', observacionesValidator],
  });

  private readonly granjaIdSeleccionada = toSignal(
    this.form.controls.granjaId.valueChanges.pipe(startWith(this.form.controls.granjaId.value)),
    { initialValue: this.form.controls.granjaId.value },
  );

  readonly granjaSeleccionada = computed(() => {
    const id = Number(this.granjaIdSeleccionada());
    return Number.isFinite(id) && id > 0
      ? this.granjas().find((g) => g.id === id) ?? null
      : null;
  });

  readonly padresDisponibles = computed(() =>
    this.referencias().filter((item) => this.esMacho(item.sexoCode)),
  );

  readonly madresDisponibles = computed(() =>
    this.referencias().filter((item) => this.esHembra(item.sexoCode)),
  );

  readonly opcionesRaza = [
    { code: 'JERSEY', label: 'Jersey' },
    { code: 'HOLSTEIN', label: 'Holstein' },
    { code: 'BROWN_SWISS', label: 'Brown Swiss' },
  ];
  readonly opcionesColor = [
    { code: 'BEIGE', labelKey: 'vacunos.form.options.color.beige' },
    { code: 'MARRON', labelKey: 'vacunos.form.options.color.marron' },
    { code: 'NEGRO_BLANCO', labelKey: 'vacunos.form.options.color.negro_blanco' },
  ];

  constructor() {
    this.form.controls.adquisicionPor.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => {
        const precio = this.form.controls.precioCompra;
        const compra = tipo === 'COMPRA';

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
    this.cargarGranjas();
    this.cargarReferencias();

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
      codigo: this.codigoCompleto(raw.codigo!),
      nombre: raw.nombre!,
      fechaNacimiento: raw.fechaNacimiento!,
      adquisicionPor: raw.adquisicionPor!,
      raza: raw.raza!,
      color: raw.color!,
      sexo: raw.sexo!,
      codigoPadre: raw.codigoPadre!,
      codigoMadre: raw.codigoMadre!,
      granjaId: Number(raw.granjaId!),
      aptoPara: raw.aptoPara!,
      fechaEspecificacion: raw.fechaEspecificacion!,
      precioCompra: raw.adquisicionPor === 'COMPRA' ? Number(raw.precioCompra) : null,
      observaciones: raw.observaciones?.trim() || undefined,
      foto: this.archivoFoto,
    };

    this.guardando.set(true);
    this.errorServidor.set(null);
    this.erroresCampo.set({});

    if (this.editando()) {
      const codigo = this.codigoOriginal ?? payload.codigo;

      this.facade
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

    this.facade
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
  limpiarFormulario(): void {
    this.form.reset({
      codigo: '',
      adquisicionPor: 'NACIMIENTO', // Restauramos el valor por defecto
      raza: 'JERSEY',               // Restauramos el valor por defecto
      sexo: 'HEMBRA',               // Restauramos el valor por defecto
      codigoPadre: '',
      codigoMadre: '',
      aptoPara: 'LECHE'
    });
    this.fotoPreview.set(null);     // Limpiamos la foto preview si existía
    this.archivoFoto = null;        // Limpiamos el archivo de foto en memoria
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
    if (errors['soloNumeros']) return this.translate.instant('vacunos.form.errors.soloNumeros');
    if (errors['min']) return this.translate.instant('vacunos.form.errors.minValor');
    if (errors['maxCaracteres']) return this.translate.instant('vacunos.form.errors.maxCaracteres', { count: 150 });
    if (errors['maxPalabras']) return this.translate.instant('vacunos.form.errors.maxPalabras');

    return this.translate.instant('vacunos.form.errors.valorInvalido');
  }

  forzarSoloNumeros(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const numeric = input.value.replace(/\D/g, '');
    this.form.get(field)?.setValue(numeric, { emitEvent: false });
    input.value = numeric;
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


  private configurarModoEdicion(): void {
    this.form.controls.codigo.disable({ emitEvent: false });
    this.form.controls.fechaNacimiento.disable({ emitEvent: false });
    this.form.controls.codigoPadre.disable({ emitEvent: false });
    this.form.controls.codigoMadre.disable({ emitEvent: false });

    const optionalOnEdit = [
      this.form.controls.codigoPadre,
      this.form.controls.codigoMadre,
      this.form.controls.granjaId,
      this.form.controls.aptoPara,
    ];

    for (const control of optionalOnEdit) {
      control.clearValidators();
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private cargarGranjas(): void {
    this.cargandoGranjas.set(true);
    this.facade
      .listarGranjas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (granjas) => {
          this.granjas.set(granjas);
          this.cargandoGranjas.set(false);
        },
        error: () => {
          this.cargandoGranjas.set(false);
        },
      });
  }

  private cargarReferencias(): void {
    this.cargandoReferencias.set(true);
    this.facade
      .listarReferencias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (referencias) => {
          this.referencias.set(referencias);
          this.cargandoReferencias.set(false);
        },
        error: () => {
          this.referencias.set([]);
          this.cargandoReferencias.set(false);
        },
      });
  }

  private cargarVacuno(codigo: string): void {
    this.cargando.set(true);
    this.errorServidor.set(null);

    this.facade
      .obtenerVacuno(codigo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (vacuno) => {
          this.cargando.set(false);
          this.form.patchValue({
            codigo: this.extraerCodigoNumero(vacuno.codigo),
            nombre: vacuno.nombre,
            fechaNacimiento: vacuno.fechaNacimiento,
            adquisicionPor: this.normalizarAdquisicion(vacuno.adquisicionPor),
            raza: vacuno.raza || 'Jersey',
            color: this.normalizarColor(vacuno.color),
            sexo: this.normalizarSexo(vacuno.sexo),
            codigoPadre: vacuno.codigoPadre ?? '',
            codigoMadre: vacuno.codigoMadre ?? '',
            granjaId: vacuno.granjaId ?? null,
            aptoPara: this.normalizarAptoPara(vacuno.aptoPara),
            fechaEspecificacion:
              vacuno.fechaRegistroFuncion ?? vacuno.fechaRegistroEspecializacion ?? vacuno.fechaNacimiento,
            observaciones: vacuno.observaciones ?? '',
          });
        },
        error: () => {
          this.cargando.set(false);
          this.errorServidor.set(this.translate.instant('vacunos.form.errors.cargaFallida'));
        },
      });
  }

  private codigoCompleto(numero: string): string {
    return `VAC${numero.trim()}`;
  }

  private extraerCodigoNumero(codigo: string): string {
    const normalized = codigo.trim().toUpperCase();
    return normalized.startsWith('VAC') ? normalized.slice(3) : normalized.replace(/\D/g, '');
  }

  private esMacho(sexoCode: string | null | undefined): boolean {
    const normalized = String(sexoCode ?? '').trim().toLowerCase();
    return normalized === 'macho' || normalized === 'm';
  }

  private esHembra(sexoCode: string | null | undefined): boolean {
    const normalized = String(sexoCode ?? '').trim().toLowerCase();
    return normalized === 'hembra' || normalized === 'h' || normalized === 'f';
  }

  private normalizarAdquisicion(value: string | undefined): AdquisicionPor {
    const normalized = String(value ?? '').trim().toUpperCase();

    if (normalized === 'COMPRA' || normalized === 'DONACION' || normalized === 'NACIMIENTO') {
      return normalized;
    }

    return 'NACIMIENTO';
  }

  private normalizarSexo(value: string | undefined): SexoVacuno {
    return String(value ?? '').toLowerCase() === 'macho' ? 'MACHO' : 'HEMBRA';
  }

  private normalizarColor(value: string | undefined): string {
    const normalized = String(value ?? '').trim().toUpperCase();
    const withoutAccents = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const compact = withoutAccents.replace(/[\s-]+/g, '_');

    if (compact === 'BEIGE' || compact === 'MARRON' || compact === 'NEGRO_BLANCO') {
      return compact;
    }

    if (compact === 'NEGRO_Y_BLANCO') {
      return 'NEGRO_BLANCO';
    }

    return '';
  }

  private normalizarAptoPara(value: string | undefined): AptoPara {
    const normalized = String(value ?? '').toLowerCase();

    if (normalized === 'leche' || normalized === 'produccion_leche') {
      return 'LECHE';
    }

    if (normalized === 'carne' || normalized === 'produccion_carne') {
      return 'CARNE';
    }

    if (normalized === 'reproduccion') {
      return 'REPRODUCCION';
    }

    return 'LECHE';
  }

  private handleError(error: unknown): void {
    this.guardando.set(false);

    const responseError = (error as { error?: Record<string, unknown> })?.error;

    if (!responseError) {
      this.errorServidor.set(this.translate.instant('vacunos.form.errors.errorInesperado'));
      return;
    }

    // Format from ExceptionHandlingMiddleware: { success: false, errorMessage: "..." }
    if (typeof responseError['errorMessage'] === 'string') {
      this.errorServidor.set(responseError['errorMessage']);
      return;
    }

    // Format from explicit controller returns: { error: { code, message, details } }
    const apiError = responseError['error'] as ApiErrorBody | undefined;

    if (!apiError) {
      this.errorServidor.set((responseError['message'] as string) ?? this.translate.instant('vacunos.form.errors.errorInesperado'));
      return;
    }

    if (apiError.code?.endsWith('ALREADY_EXISTS')) {
      this.erroresCampo.set({ codigo: apiError.message });
      return;
    }

    const fieldErrors = apiError.fieldErrors ?? apiError.details?.filter(isApiFieldError) ?? [];

    if (apiError.code?.endsWith('VALIDATION_ERROR') && fieldErrors.length) {
      const mapped: Record<string, string> = {};

      for (const detail of fieldErrors) {
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
      GranjaId: 'granjaId',
      AptoPara: 'aptoPara',
      FechaEspecificacion: 'fechaEspecificacion',
      Observaciones: 'observaciones',
      Foto: 'foto',
    };

    return map[field] ?? field.charAt(0).toLowerCase() + field.slice(1);
  }

}



interface ApiErrorBody {
  code: string;
  message: string;
  details?: Array<string | ApiFieldError>;
  fieldErrors?: Array<{ field: string; code: string; message: string }>;
}

interface ApiFieldError {
  field: string;
  message: string;
}

function isApiFieldError(detail: string | ApiFieldError): detail is ApiFieldError {
  return typeof detail !== 'string' && typeof detail.field === 'string';
}
