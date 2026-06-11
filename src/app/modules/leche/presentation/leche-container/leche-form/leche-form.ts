import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';
import { RegistrarLecheRequest } from '@modules/leche/domain/models/leche.model';

@Component({
  selector: 'zt-leche-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './leche-form.html',
  styleUrl: './leche-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheForm implements OnInit {
  private readonly facade = inject(LecheFacade);

  encargadoUsuarioId = input<number | null>(null);
  encargadoNombre = input('');
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  private auth = inject(AuthService);
  form: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  codigoRegistro = signal('REG-' + new Date().getTime());
  vacunos = this.facade.vacunos;
  vacunoSeleccionado = signal<any>(null);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fecha: ['', Validators.required],
      vacunoId: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0)]],
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

    const payload: RegistrarLecheRequest = {
      fechaHora: this.form.get('fecha')?.value,
      vacunoId: Number(this.form.get('vacunoId')?.value),
      litros: Number(this.form.get('cantidad')?.value),
      encargadoUsuarioId: encargadoId,
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
}
