import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

import { VacunosFacade } from '../../../../vacunos/application/vacunos.facade';
import { Vacuno } from '../../../../vacunos/domain/models/vacuno.model';

@Component({
  selector: 'zt-fecundacion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './fecundacion-form.html',
  styleUrl: './fecundacion-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly vacunosFacade = inject(VacunosFacade);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly http = inject(HttpClient);

  readonly guardando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly erroresCampo = signal<Record<string, string>>({});

  // Listas locales para los buscadores de vacuno
  readonly receptores = signal<Vacuno[]>([]);
  readonly donantes = signal<Vacuno[]>([]);

  // Textos vinculados a los inputs del buscador
  textoBusquedaReceptor = '';
  textoBusquedaDonante = '';

  // Visibilidad de los dropdowns
  readonly mostrarDropdownReceptor = signal(false);
  readonly mostrarDropdownDonante = signal(false);

  // Listas filtradas reactivamente
  readonly receptoresFiltrados = computed(() => {
    const term = this.textoBusquedaReceptor.toLowerCase().trim();
    if (!term) return this.receptores();
    return this.receptores().filter(
      (v) => v.codigo.toLowerCase().includes(term) || v.nombre.toLowerCase().includes(term)
    );
  });

  readonly donantesFiltrados = computed(() => {
    const term = this.textoBusquedaDonante.toLowerCase().trim();
    if (!term) return this.donantes();
    return this.donantes().filter(
      (v) => v.codigo.toLowerCase().includes(term) || v.nombre.toLowerCase().includes(term)
    );
  });

  // Grupo de Controles
  readonly form = this.fb.group({
    tipoFecundacionCode: ['', Validators.required],
    vacunoReceptorId: [null as number | null, Validators.required],
    vacunoDonanteId: [null as number | null],
    machoExterno: [false],
    fechaProcedimiento: [this.getTodayDateString(), Validators.required],
    responsableName: ['', [Validators.required, Validators.maxLength(100)]],
    resultadoCode: ['', Validators.required],
    observaciones: ['', Validators.maxLength(250)],
  });

  constructor() {
    // Escuchar el cambio en el checkbox "machoExterno"
    this.form.controls.machoExterno.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isExterno) => {
        const donanteCtrl = this.form.controls.vacunoDonanteId;
        if (isExterno) {
          donanteCtrl.clearValidators();
          donanteCtrl.setValue(null);
          this.textoBusquedaDonante = '';
        } else {
          donanteCtrl.setValidators(Validators.required);
        }
        donanteCtrl.updateValueAndValidity();
      });

    // Escuchar el cambio en "tipoFecundacionCode"
    this.form.controls.tipoFecundacionCode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => {
        const donanteCtrl = this.form.controls.vacunoDonanteId;
        if (tipo === 'MN' && !this.form.controls.machoExterno.value) {
          donanteCtrl.setValidators(Validators.required);
        } else {
          donanteCtrl.clearValidators();
        }
        donanteCtrl.updateValueAndValidity();
      });
  }

  ngOnInit(): void {
    this.cargarVacunos();
  }

  // Carga inicial de vacunos discriminados por sexo
  private cargarVacunos(): void {
    this.vacunosFacade.listarVacunos({ limit: 1000, estado: 'activo' }).subscribe({
      next: (res) => {
        const items = res.items || [];
        this.receptores.set(items.filter((v) => v.sexo === 'hembra'));
        this.donantes.set(items.filter((v) => v.sexo === 'macho'));
      },
      error: () => {
        this.errorServidor.set(this.translate.instant('reproduccion.fecundacion.form.errors.cargarVacunosFailed'));
      },
    });
  }

  // Cierre de dropdowns al hacer clic fuera del buscador
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.buscador-container')) {
      this.mostrarDropdownReceptor.set(false);
      this.mostrarDropdownDonante.set(false);
    }
  }

  // Métodos del buscador de Receptores
  onBusquedaReceptorChange(): void {
    this.mostrarDropdownReceptor.set(true);
    this.form.patchValue({ vacunoReceptorId: null });
  }

  toggleDropdownReceptor(event: Event): void {
    event.stopPropagation();
    this.mostrarDropdownReceptor.update((v) => !v);
    this.mostrarDropdownDonante.set(false);
  }

  seleccionarReceptor(vaca: Vacuno): void {
    this.form.patchValue({ vacunoReceptorId: vaca.id });
    this.textoBusquedaReceptor = `${vaca.codigo} - ${vaca.nombre}`;
    this.mostrarDropdownReceptor.set(false);
  }

  // Métodos del buscador de Donantes
  onBusquedaDonanteChange(): void {
    this.mostrarDropdownDonante.set(true);
    this.form.patchValue({ vacunoDonanteId: null });
  }

  toggleDropdownDonante(event: Event): void {
    event.stopPropagation();
    this.mostrarDropdownDonante.update((v) => !v);
    this.mostrarDropdownReceptor.set(false);
  }

  seleccionarDonante(toro: Vacuno): void {
    this.form.patchValue({ vacunoDonanteId: toro.id });
    this.textoBusquedaDonante = `${toro.codigo} - ${toro.nombre}`;
    this.mostrarDropdownDonante.set(false);
  }

  // Lógica de Envío del Formulario
  guardar(): void {
    this.form.markAllAsTouched();

    // Validar campo externo manualmente si está activo
    const raw = this.form.getRawValue();
    if (raw.machoExterno && !this.textoBusquedaDonante.trim()) {
      this.form.controls.vacunoDonanteId.setErrors({ required: true });
    }

    if (this.form.invalid) {
      return;
    }

    const payload = {
      tipoFecundacionCode: raw.tipoFecundacionCode,
      vacunoReceptorId: raw.vacunoReceptorId,
      vacunoDonanteId: raw.vacunoDonanteId,
      machoExterno: raw.machoExterno,
      machoExternoNombre: raw.machoExterno ? this.textoBusquedaDonante.trim() : null,
      fechaProcedimiento: raw.fechaProcedimiento,
      responsableName: raw.responsableName?.trim(),
      resultadoCode: raw.resultadoCode,
      observaciones: raw.observaciones?.trim() || null,
    };

    this.guardando.set(true);
    this.errorServidor.set(null);
    this.erroresCampo.set({});

    this.http.post(`${environment.apiUrl}/api/v1/fecundacion`, payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cancelar();
      },
      error: (err) => {
        this.guardando.set(false);
        const errBody = err.error?.error;
        if (errBody?.code === 'VALIDATION_ERROR' && errBody.details) {
          const mapped: Record<string, string> = {};
          errBody.details.forEach((d: any) => {
            mapped[this.mapCampo(d.field)] = d.message;
          });
          this.erroresCampo.set(mapped);
        } else {
          this.errorServidor.set(
            err.error?.message ?? this.translate.instant('reproduccion.fecundacion.form.errors.guardarFailed')
          );
        }
      },
    });
  }

  cancelar(): void {
    void this.router.navigate(['/reproduccion/fecundacion']);
  }

  // Helpers para errores en vista
  campoInvalido(name: string): boolean {
    const control = this.form.get(name);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  mensajeError(name: string): string {
    const serverMessage = this.erroresCampo()[name];
    if (serverMessage) return serverMessage;

    const control = this.form.get(name);
    if (control?.hasError('required')) {
      return this.translate.instant('reproduccion.fecundacion.form.errors.campoObligatorio');
    }
    if (control?.hasError('maxlength')) {
      return this.translate.instant('reproduccion.fecundacion.form.errors.maxCaracteres');
    }
    return this.translate.instant('reproduccion.fecundacion.form.errors.valorInvalido');
  }

  private mapCampo(field: string): string {
    const map: Record<string, string> = {
      TipoFecundacionCode: 'tipoFecundacionCode',
      VacunoReceptorId: 'vacunoReceptorId',
      VacunoDonanteId: 'vacunoDonanteId',
      FechaProcedimiento: 'fechaProcedimiento',
      ResponsableName: 'responsableName',
      ResultadoCode: 'resultadoCode',
      Observaciones: 'observaciones',
    };
    return map[field] ?? field.charAt(0).toLowerCase() + field.slice(1);
  }

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
