import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { VacunosFacade } from '../../application/vacunos.facade';
import { VACUNO_REQUIREMENTS_CONFIG } from '../../config/vacuno-requirements.config';
import {
  EditarVacunoRequest,
  GranjaCatalogOption,
  RegistrarVacunoRequest,
  Vacuno,
  VacunoCatalogOption,
} from '../../domain/models/vacuno.model';

export function soloMayusculas(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  return !value || VACUNO_REQUIREMENTS_CONFIG.validationPatterns.codigo.test(value)
    ? null
    : { soloMayusculas: true };
}

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
  private readonly facade = inject(VacunosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly config = VACUNO_REQUIREMENTS_CONFIG;
  readonly guardando = signal(false);
  readonly cargando = signal(true);
  readonly editando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly tiposAdquisicion = signal<VacunoCatalogOption[]>([]);
  readonly razas = signal<VacunoCatalogOption[]>([]);
  readonly colores = signal<VacunoCatalogOption[]>([]);
  readonly sexos = signal<VacunoCatalogOption[]>([]);
  readonly granjas = signal<GranjaCatalogOption[]>([]);
  readonly posiblesPadres = signal<Vacuno[]>([]);
  readonly posiblesMadres = signal<Vacuno[]>([]);

  private vacunoId: number | null = null;

  readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(this.config.fieldLimits.codigo), soloMayusculas]],
    nombre: ['', [Validators.required, Validators.maxLength(this.config.fieldLimits.nombre)]],
    fechaNacimiento: ['', Validators.required],
    tipoAdquisicionCode: ['', [Validators.required, Validators.maxLength(this.config.fieldLimits.catalogoCodigo)]],
    razaCode: ['', [Validators.required, Validators.maxLength(this.config.fieldLimits.catalogoCodigo)]],
    colorCode: ['', [Validators.required, Validators.maxLength(this.config.fieldLimits.catalogoCodigo)]],
    sexoCode: ['', [Validators.required, Validators.maxLength(10)]],
    padreId: [null as number | null],
    madreId: [null as number | null],
    granjaId: [null as number | null, [Validators.required, Validators.min(1)]],
    observaciones: ['', Validators.maxLength(this.config.fieldLimits.observacionesCaracteres)],
  });

  ngOnInit(): void {
    const routeValue = this.route.snapshot.paramMap.get('codigo');
    const parsedId = routeValue ? Number(routeValue) : null;

    if (parsedId && Number.isInteger(parsedId) && parsedId > 0) {
      this.vacunoId = parsedId;
      this.editando.set(true);
      this.form.controls.codigo.disable({ emitEvent: false });
    }

    this.cargarDatosIniciales();
  }

  guardar(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    const payload: RegistrarVacunoRequest = {
      codigo: raw.codigo!.trim().toUpperCase(),
      nombre: raw.nombre!.trim(),
      fechaNacimiento: raw.fechaNacimiento!,
      tipoAdquisicionCode: raw.tipoAdquisicionCode!,
      razaCode: raw.razaCode!,
      colorCode: raw.colorCode!,
      sexoCode: raw.sexoCode!,
      padreId: raw.padreId ?? null,
      madreId: raw.madreId ?? null,
      granjaId: Number(raw.granjaId),
      observaciones: raw.observaciones?.trim() || undefined,
    };

    this.guardando.set(true);
    this.errorServidor.set(null);

    if (this.editando() && this.vacunoId) {
      const { codigo: _codigo, ...editable } = payload;
      this.actualizar(this.vacunoId, editable);
      return;
    }

    this.facade.registrarVacuno(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (created) => {
        this.guardando.set(false);
        void this.router.navigate(['/vacunos'], { queryParams: { created: created.codigo } });
      },
      error: (error) => this.handleError(error),
    });
  }

  cancelar(): void {
    void this.router.navigate(['/vacunos']);
  }

  campoInvalido(name: string): boolean {
    const control = this.form.get(name);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  mensajeError(name: string): string {
    const errors = this.form.get(name)?.errors;

    if (!errors) return '';
    if (errors['required']) return this.translate.instant('vacunos.form.errors.campoObligatorio');
    if (errors['maxlength']) {
      return this.translate.instant('vacunos.form.errors.maxCaracteres', {
        count: errors['maxlength'].requiredLength,
      });
    }
    if (errors['soloMayusculas']) return this.translate.instant('vacunos.form.errors.soloMayusculas');
    if (errors['min']) return this.translate.instant('vacunos.form.errors.minValor');
    return this.translate.instant('vacunos.form.errors.valorInvalido');
  }

  forzarMayusculas(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value
      .toUpperCase()
      .replace(this.config.validationPatterns.codigoSanitizer, '')
      .slice(0, this.config.fieldLimits.codigo);
    this.form.controls.codigo.setValue(value, { emitEvent: false });
    input.value = value;
  }

  private cargarDatosIniciales(): void {
    forkJoin({
      catalogos: this.facade.obtenerCatalogos(),
      vacunos: this.facade.listarVacunos({ limit: 10_000 }),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ catalogos, vacunos }) => {
        this.tiposAdquisicion.set(catalogos.tiposAdquisicion);
        this.razas.set(catalogos.razas);
        this.colores.set(catalogos.colores);
        this.sexos.set(catalogos.sexos);
        this.granjas.set(catalogos.granjas);
        this.posiblesPadres.set(vacunos.items.filter((item) => item.sexoCode.toUpperCase() === 'MACHO'));
        this.posiblesMadres.set(vacunos.items.filter((item) => item.sexoCode.toUpperCase() === 'HEMBRA'));

        if (this.vacunoId) {
          this.cargarVacuno(this.vacunoId);
        } else {
          this.cargando.set(false);
        }
      },
      error: (error) => {
        this.cargando.set(false);
        this.handleError(error);
      },
    });
  }

  private cargarVacuno(id: number): void {
    this.facade.obtenerVacuno(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (vacuno) => {
        this.form.patchValue({
          codigo: vacuno.codigo,
          nombre: vacuno.nombre,
          fechaNacimiento: vacuno.fechaNacimiento,
          tipoAdquisicionCode: vacuno.tipoAdquisicionCode,
          razaCode: vacuno.razaCode,
          colorCode: vacuno.colorCode,
          sexoCode: vacuno.sexoCode,
          padreId: vacuno.padreId,
          madreId: vacuno.madreId,
          granjaId: vacuno.granjaId,
          observaciones: vacuno.observaciones ?? '',
        });
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.handleError(error);
      },
    });
  }

  private actualizar(id: number, payload: EditarVacunoRequest): void {
    this.facade.actualizarVacuno(id, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.guardando.set(false);
        void this.router.navigate(['/vacunos'], { queryParams: { updated: updated.codigo } });
      },
      error: (error) => this.handleError(error),
    });
  }

  private handleError(error: unknown): void {
    this.guardando.set(false);
    const response = error as { error?: { errorMessage?: string; message?: string } };
    this.errorServidor.set(
      response.error?.errorMessage
      ?? response.error?.message
      ?? this.translate.instant('vacunos.form.errors.errorServidor'),
    );
  }
}
