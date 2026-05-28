import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';

@Component({
  selector: 'zt-leche-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './leche-form.html',
  styleUrl: './leche-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheForm implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  private readonly facade = inject(LecheFacade);
  private readonly fb = inject(FormBuilder);

  form: FormGroup;
  loading = this.facade.loading;
  vacunos = this.facade.vacunos;
  vacunoSeleccionado = signal<any>(null);
  historialVacuno = signal<any[]>([]);
  encargadoNombre = 'Juan Pérez';
  
  // Código autogenerado para visualización, el backend puede sobreescribirlo o usarlo
  codigoRegistro = signal('ORD-' + Math.floor(1000 + Math.random() * 9000));

  constructor() {
    this.form = this.fb.group({
      fechaHora: [this.getCurrentDateTime(), Validators.required],
      vacunoId: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0)]],
      encargado: [{ value: this.encargadoNombre, disabled: true }],
      observaciones: ['', Validators.maxLength(150)],
    });
  }

  ngOnInit(): void {
    this.facade.cargarVacunos();
  }

  private getCurrentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
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
      // Mock de historial para la visualización lateral
      this.historialVacuno.set([
        { fecha: '2023-10-01', cantidad: 15 },
        { fecha: '2023-10-02', cantidad: 14 },
        { fecha: '2023-10-03', cantidad: 16 },
      ]);
    }
  }

  async onGuardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    
    // SQL Server / .NET suelen preferir la fecha local sin el sufijo 'Z' (UTC)
    // para evitar conflictos con restricciones de "fecha no futura".
    const localDate = new Date(formValue.fechaHora);
    const datePart = localDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const timePart = localDate.toTimeString().split(' ')[0]; // HH:mm:ss
    const formattedFechaHora = `${datePart}T${timePart}`;

    const request = {
      codigo: 'ORD-' + Math.floor(1000 + Math.random() * 9000), 
      fechaHora: formattedFechaHora,
      vacunoId: +formValue.vacunoId, 
      encargadoUsuarioId: 1, 
      litros: +formValue.cantidad, 
      estadoOrdenioCode: 'ACTIVO',
      observaciones: formValue.observaciones || ''
    };

    try {
      await this.facade.crearRegistro(request);
      this.onCancel();
    } catch (error) {
      console.error('Error al guardar ordeño:', error);
      // El error interceptor ya se encarga de mostrar el mensaje detallado
    }
  }

  onCancel(): void {
    this.form.reset({
      fechaHora: this.getCurrentDateTime(),
      encargado: this.encargadoNombre
    });
    this.vacunoSeleccionado.set(null);
    this.historialVacuno.set([]);
    this.close.emit();
  }

  onCancelar(): void {
    this.onCancel();
  }
}
