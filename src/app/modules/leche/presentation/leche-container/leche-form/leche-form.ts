import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  signal,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-leche-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './leche-form.html',
  styleUrl: './leche-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheForm {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    fecha: string;
    hora: string;
    vaca: string;
    codigo: string;
    litro: number | null;
    observaciones: string;
  }>();

  form: FormGroup;
  loading = signal(false);
  codigoRegistro = signal('REG-' + new Date().getTime());
  vacunos = signal([
    {
      id: 1,
      nombre: 'Vaca Lola',
      codigo: 'V001',
      raza: 'Holstein',
      ultimoRegistro: '2023-10-01',
      promedio: '15L',
    },
    {
      id: 2,
      nombre: 'Vaca Pinta',
      codigo: 'V002',
      raza: 'Jersey',
      ultimoRegistro: '2023-10-02',
      promedio: '12L',
    },
  ]);
  vacunoSeleccionado = signal<any>(null);
  historialVacuno = signal<any[]>([]);
  encargadoNombre = 'Juan Pérez';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fecha: ['', Validators.required],
      vacunoId: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0)]],
      encargado: [{ value: this.encargadoNombre, disabled: true }],
      observaciones: [''],
    });
  }

  isInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onVacunoChange(): void {
    const vacunoId = this.form.get('vacunoId')?.value;
    const vacuno = this.vacunos().find((v) => v.id === +vacunoId);
    if (vacuno) {
      this.vacunoSeleccionado.set(vacuno);
      this.historialVacuno.set([
        { fecha: '2023-10-01', cantidad: 15 },
        { fecha: '2023-10-02', cantidad: 14 },
        { fecha: '2023-10-03', cantidad: 16 },
      ]);
    }
  }

  onGuardar(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    setTimeout(() => {
      this.save.emit({
        fecha: this.form.get('fecha')?.value,
        hora: new Date().toLocaleTimeString(),
        vaca: this.vacunoSeleccionado()?.nombre || '',
        codigo: this.codigoRegistro(),
        litro: this.form.get('cantidad')?.value,
        observaciones: this.form.get('observaciones')?.value || '',
      });
      this.loading.set(false);
      this.onCancel();
    }, 1000);
  }

  onCancel(): void {
    this.form.reset();
    this.vacunoSeleccionado.set(null);
    this.historialVacuno.set([]);
    this.close.emit();
  }

  onCancelar(): void {
    this.onCancel();
  }
}
