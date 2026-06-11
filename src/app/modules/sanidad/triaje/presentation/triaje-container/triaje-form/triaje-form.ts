import { ChangeDetectionStrategy, Component, computed, inject, input, output, effect, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ActualizarTriajePayload,
  RegistrarTriajePayload,
  TriajeHistorialItem,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
  Triaje, // <-- necesitas este modelo, lo definimos abajo
} from '../../../domain/models/triaje.model';
import { ToastService } from '@shared/services/toast.service';

export type TriajeFormMode = 'new' | 'view';

function getLocalDefaultDateTime(): string {
  const now = new Date();
  // Restamos 5 minutos para evitar problemas de desincronización horaria (clock skew) con la BD
  now.setMinutes(now.getMinutes() - 5);
  const offset = now.getTimezoneOffset();
  const localTime = new Date(now.getTime() - offset * 60 * 1000);
  return localTime.toISOString().substring(0, 16);
}

@Component({
  selector: 'zt-triaje-form',
  imports: [ReactiveFormsModule, DatePipe, TranslatePipe],
  templateUrl: './triaje-form.html',
  styleUrl: './triaje-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeForm {
  private readonly formBuilder = inject(FormBuilder);

  triajeCode = input('');
  vacunos = input<TriajeVacunoOption[]>([]);
  tiposPeso = input<TriajeTipoPesoOption[]>([]);
  historial = input<TriajeHistorialItem[]>([]);
  mode = input<TriajeFormMode>('new');
  triajeData = input<Triaje | null>(null); 

  cancelled = output<void>();
  saved = output<RegistrarTriajePayload>();
  edited = output<ActualizarTriajePayload>();
  deleted = output<number>();
  vacunoSelected = output<number>();

  isEditing = signal(false);
  toastService = inject(ToastService);

  protected readonly isViewMode = computed(() => this.mode() === 'view');

  protected readonly form = this.formBuilder.nonNullable.group({
    fecha_hora: [getLocalDefaultDateTime(), Validators.required],
    vacunoId: this.formBuilder.control<number>(0, Validators.required),
    pesoKg: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
    tipoPesoCode: ['', Validators.required],
    observaciones: ['', Validators.maxLength(150)],
  });
  constructor() {
    this.form.controls.vacunoId.valueChanges
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(val => {
        if (val && !this.isViewMode()) {
          this.vacunoSelected.emit(val);
        }
      });

   effect(() => {
  const data = this.triajeData();
  if (data && this.isViewMode()) {
    this.isEditing.set(false);

    this.form.disable(); 

    this.form.patchValue({ 
      fecha_hora: data.fechaHora ? data.fechaHora.substring(0, 16) : '',
      vacunoId: data.vacunoId,
      pesoKg: data.pesoKg,
      tipoPesoCode: data.tipoPesoCode,
      observaciones: data.observaciones ?? '',
    });
    this.form.disable();
    return;
  } else {
    this.isEditing.set(false);
    this.form.enable();
    this.form.reset();
    this.form.patchValue({
      fecha_hora: getLocalDefaultDateTime()
    });
  }
});
  }

  onCancel(): void {
    this.cancelled.emit();
  }
  startEdit(): void {
    this.isEditing.set(true);
    this.form.enable();
    this.form.controls.fecha_hora.disable();
    this.form.controls.vacunoId.disable();
  }
  onEdit(): void {    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    if (raw.vacunoId === null || raw.pesoKg === null) return;
    this.edited.emit({
      tipoPesoCode: raw.tipoPesoCode,
      pesoKg: raw.pesoKg,
      observaciones: raw.observaciones || null,
      //estadoRegistroCode: 'ACTIVO',
      //encargadoUsuarioId: null,
    });
  }
onSaveEdit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const raw = this.form.getRawValue();

  if (raw.vacunoId === null || raw.pesoKg === null) {
    return;
  }

  this.edited.emit({
    tipoPesoCode: raw.tipoPesoCode,
    pesoKg: raw.pesoKg,
    observaciones: raw.observaciones || null,
    //estadoRegistroCode: 'ACTIVO',
    //encargadoUsuarioId: null,
  });
}

  onDelete(): void {
    const data = this.triajeData();
    if (data) this.deleted.emit(data.id);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (raw.vacunoId === null ||raw.pesoKg === null) {
      return;
    }

    this.saved.emit({

      fechaHora: raw.fecha_hora,
      vacunoId: raw.vacunoId,
      tipoPesoCode: raw.tipoPesoCode,
      pesoKg: raw.pesoKg,
      observaciones: raw.observaciones || null,
      estadoRegistroCode: 'ACTIVO',
      encargadoUsuarioId: null,
    });
  }
}