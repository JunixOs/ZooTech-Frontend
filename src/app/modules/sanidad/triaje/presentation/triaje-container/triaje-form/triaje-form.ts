import { ChangeDetectionStrategy, Component, computed, inject, input, output, effect, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  RegistrarTriajePayload,
  TriajeHistorialItem,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
  Triaje, // <-- necesitas este modelo, lo definimos abajo
} from '../../../domain/models/triaje.model';

export type TriajeFormMode = 'new' | 'view';

@Component({
  selector: 'zt-triaje-form',
  imports: [ReactiveFormsModule,DatePipe],
  templateUrl: './triaje-form.html',
  styleUrl: './triaje-form.scss',
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
  edited = output<RegistrarTriajePayload>();
  deleted = output<number>();

  isEditing = signal(false);

  protected readonly isViewMode = computed(() => this.mode() === 'view');
  protected readonly title = computed(() => {
    const code = this.triajeCode().trim();
    if (this.isViewMode()) return code ? `TRIAJE/${code}` : 'DETALLE TRIAJE';
    return code ? `NUEVO TRIAJE/${code}` : 'NUEVO TRIAJE/';
  });

  protected readonly form = this.formBuilder.nonNullable.group({
    fecha_hora: ['', Validators.required],
    vacunoId: this.formBuilder.control<number>(0, Validators.required),
    pesoKg: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
    tipoPesoCode: ['', Validators.required],
    observaciones: ['', Validators.maxLength(150)],
  });
  constructor() {
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
      fechaHora: raw.fecha_hora,
      vacunoId: raw.vacunoId,
      tipoPesoCode: raw.tipoPesoCode,
      pesoKg: raw.pesoKg,
      observaciones: raw.observaciones || null,
      estadoRegistroCode: 'ACTIVO',
      encargadoUsuarioId: null,
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
    fechaHora: raw.fecha_hora,
    vacunoId: raw.vacunoId,
    tipoPesoCode: raw.tipoPesoCode,
    pesoKg: raw.pesoKg,
    observaciones: raw.observaciones || null,
    estadoRegistroCode: 'ACTIVO',
    encargadoUsuarioId: null,
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