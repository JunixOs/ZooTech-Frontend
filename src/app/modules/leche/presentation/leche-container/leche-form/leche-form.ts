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

  encargadoUsuarioId = input<number | null>(null);
  encargadoNombre = input('');
  close = output<void>();
  save = output<void>();

  form: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  codigoRegistro = signal(`ORD${this.formatCodigoDate(new Date())}`);
  vacunos = this.facade.vacunos;
  vacunoSeleccionado = signal<LecheVacunoOption | null>(null);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fecha: ['', Validators.required],
      vacunoId: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0.01)]],
      encargado: [{ value: '', disabled: true }],
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    this.form.get('encargado')?.setValue(this.encargadoNombre());
    this.cargarVacunos();
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
    }
  }

  async onGuardar(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    const encargadoId = this.encargadoUsuarioId();
    if (!encargadoId) {
      this.errorMessage.set('leche.registro.errors.missingResponsible');
      return;
    }

    this.loading.set(true);

    const fechaHora = String(this.form.get('fecha')?.value ?? '');
    const payload: RegistrarLecheRequest = {
      codigo: this.codigoRegistro(),
      fechaHora,
      vacunoId: Number(this.form.get('vacunoId')?.value),
      litros: Number(this.form.get('cantidad')?.value),
      encargadoUsuarioId: encargadoId,
      estadoOrdenioCode: this.getEstadoOrdenioCode(fechaHora),
      observaciones: this.form.get('observaciones')?.value || undefined,
    };

    try {
      await this.facade.registrarRegistro(payload);
      this.save.emit();
      this.loading.set(false);
      this.onCancel();
    } catch (err) {
      console.error('[LecheForm] Error al registrar ordeño:', err);
      this.errorMessage.set('leche.registro.errors.saveFailed');
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.form.reset();
    this.vacunoSeleccionado.set(null);
    this.errorMessage.set(null);
    this.close.emit();
  }

  onCancelar(): void {
    this.onCancel();
  }

  private async cargarVacunos(): Promise<void> {
    try {
      await this.facade.cargarVacunos();
    } catch (err) {
      console.error('[LecheForm] Error al cargar vacunos:', err);
      this.errorMessage.set('leche.registro.errors.loadCattleFailed');
    }
  }

  private getEstadoOrdenioCode(fechaHora: string): string {
    const hour = new Date(fechaHora).getHours();
    return hour < 12 ? 'MANANA' : 'TARDE';
  }

  private formatCodigoDate(date: Date): string {
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
  }
}
