import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  RegistrarTriajePayload,
  TriajeHistorialItem,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
} from '../../../domain/models/triaje.model';

@Component({
  selector: 'app-triaje-form',
  imports: [ReactiveFormsModule],
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

  cancelled = output<void>();
  saved = output<RegistrarTriajePayload>();

  protected readonly title = computed(() => {
    const code = this.triajeCode().trim();
    return code ? `NUEVO TRIAJE/${code}` : 'NUEVO TRIAJE/';
  });

  protected readonly form = this.formBuilder.nonNullable.group({
    fecha_hora: ['', Validators.required],
    vacuno_id: ['', Validators.required],
    peso_kg: this.formBuilder.control<number | null>(null,[
      Validators.required,
      Validators.min(0.01),
    ]),
    tipo_peso_code: ['', Validators.required],
    observaciones: ['', Validators.maxLength(150)],
  });

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const raw = this.form.getRawValue();

  if (raw.peso_kg === null) {
    return;
  }

  this.saved.emit({
    fecha_hora: raw.fecha_hora,
    vacuno_id: raw.vacuno_id,
    tipo_peso_code: raw.tipo_peso_code,
    peso_kg: raw.peso_kg,
    observaciones: raw.observaciones || null,
  });
  }
}