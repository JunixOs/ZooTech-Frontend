import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
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
    vacunoId: ['', Validators.required],
    pesoKg: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
    tipoPesoCode: ['', Validators.required],
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

    if (raw.pesoKg === null) return;

    this.saved.emit({
      vacunoId: Number(raw.vacunoId),
      tipoPesoCode: raw.tipoPesoCode,
      pesoKg: raw.pesoKg,
      observaciones: raw.observaciones || null,
      estadoRegistroCode: 'ACTIVO',
      encargadoUsuarioId: null
    });
  }
}