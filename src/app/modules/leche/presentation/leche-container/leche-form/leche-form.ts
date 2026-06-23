import {
  Component,
  output,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  input,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';
import { LecheVacunoOption, RegistrarLecheRequest } from '@modules/leche/domain/models/leche.model';

@Component({
  selector: 'zt-leche-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './leche-form.html',
  styleUrl: './leche-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheForm implements OnInit {
  private readonly facade = inject(LecheFacade);
  private readonly fb = inject(FormBuilder);

  encargadoUsuarioId = input<number | null>(null);
  encargadoNombre = input('');
  close = output<void>();
  save = output<void>();

  form: FormGroup;
  loading = this.facade.loading;
  errorMessage = signal<string | null>(null);
  codigoRegistro = signal('ORD-' + Math.floor(1000 + Math.random() * 9000));
  vacunos = this.facade.vacunos;
  vacunoSeleccionado = signal<LecheVacunoOption | null>(null);

  constructor() {
    this.form = this.fb.group({
      fechaHora: [this.getCurrentDateTime(), Validators.required],
      vacunoId: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0)]],
      encargado: [{ value: '', disabled: true }],
      observaciones: ['', Validators.maxLength(150)],
    });
  }

  ngOnInit(): void {
    this.form.get('encargado')?.setValue(this.encargadoNombre());
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

  async onVacunoChange(): Promise<void> {
    const vacunoId = this.form.get('vacunoId')?.value;
    const vacuno = this.vacunos().find((v) => v.id === +vacunoId);
    if (vacuno) {
      this.vacunoSeleccionado.set(vacuno);
      // Mock de historial para la visualización lateral
    }
  }
  async onGuardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const encargadoId = this.encargadoUsuarioId() || 1;

    // SQL Server / .NET suelen preferir la fecha local sin el sufijo 'Z' (UTC)
    const localDate = new Date(formValue.fechaHora);
    const datePart = localDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const timePart = localDate.toTimeString().split(' ')[0]; // HH:mm:ss
    const formattedFechaHora = `${datePart}T${timePart}`;

    const payload: RegistrarLecheRequest = {
      fechaHora: formattedFechaHora,
      vacunoId: Number(formValue.vacunoId),
      litros: Number(formValue.cantidad),
      encargadoUsuarioId: encargadoId,
      observaciones: formValue.observaciones || undefined,
    };

    try {
      await this.facade.registrarRegistro(payload);
      this.save.emit();
      this.onCancel();
    } catch (err) {
      console.error('[LecheForm] Error al registrar ordeño:', err);
      this.errorMessage.set('leche.registro.errors.saveFailed');
    }
  }

  onCancel(): void {
    this.form.reset({
      fechaHora: this.getCurrentDateTime(),
      encargado: this.encargadoNombre()
    });
    this.vacunoSeleccionado.set(null);
    this.errorMessage.set(null);
    this.close.emit();
  }

  onCancelar(): void {
    this.onCancel();
  }
}
