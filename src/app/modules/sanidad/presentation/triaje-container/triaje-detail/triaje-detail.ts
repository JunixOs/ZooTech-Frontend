import { ChangeDetectionStrategy, Component, input, output, signal, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-triaje-detail',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './triaje-detail.html',
  styleUrl: './triaje-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeDetail {
  triageId = input.required<string>();
  cancelled = output<void>();
  saved = output<void>();

  private fb = inject(FormBuilder);
  
  isEditing = signal(false);

  form: FormGroup = this.fb.group({
    fecha: [{ value: '01/02/2023 02:00 PM', disabled: true }],
    vacuno: [{ value: 'VAC_0010 / LOLA', disabled: true }],
    peso: [{ value: 65.430, disabled: true }, [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
    tipoPeso: [{ value: 'Rutinario', disabled: true }, Validators.required],
    observaciones: [{ value: 'Ninguna', disabled: true }]
  });

  historial = [
    { fechaHora: '19/05/2022 05:00 PM', encargado: 'Rutinario', peso: 66.464 },
    { fechaHora: '15/05/2022 05:15 PM', encargado: 'Rutinario', peso: 55.549 },
    { fechaHora: '14/05/2022 02:00 PM', encargado: 'Rutinario', peso: 45.646 },
    { fechaHora: '13/05/2022 03:00 PM', encargado: 'Rutinario', peso: 35.264 },
    { fechaHora: '10/05/2022 04:00 PM', encargado: 'Rutinario', peso: 20.566 },
    { fechaHora: '14/05/2022 02:00 PM', encargado: 'Destete', peso: 12.498 },
    { fechaHora: '13/05/2022 03:00 PM', encargado: 'Rutinario', peso: 10.646 },
    { fechaHora: '10/05/2022 04:00 PM', encargado: 'Nacimiento', peso: 6.240 }
  ];

  constructor() {
    effect(() => {
      // Simulate fetching data when triageId changes
      const id = this.triageId();
      if (id) {
        this.isEditing.set(false);
        this.disableEditFields();
        // Here we would fetch and patch the form
      }
    });
  }

  enableEdit() {
    this.isEditing.set(true);
    this.form.get('peso')?.enable();
    this.form.get('tipoPeso')?.enable();
    this.form.get('observaciones')?.enable();
  }

  disableEditFields() {
    this.form.get('peso')?.disable();
    this.form.get('tipoPeso')?.disable();
    this.form.get('observaciones')?.disable();
  }

  cancel() {
    if (this.isEditing()) {
      this.isEditing.set(false);
      this.disableEditFields();
      // Reset form values to original (mocked for now)
      this.form.patchValue({
        peso: 65.430,
        tipoPeso: 'Rutinario',
        observaciones: 'Ninguna'
      });
    } else {
      this.cancelled.emit();
    }
  }

  save() {
    if (this.form.valid) {
      // API call to save
      alert('Triaje editado con éxito');
      this.saved.emit();
    } else {
      this.form.markAllAsTouched();
    }
  }

  delete() {
    if(confirm('¿Está seguro de eliminar este triaje?')) {
      // API call to delete
      this.saved.emit(); // Emitting saved for now to go back and refresh
    }
  }
}

