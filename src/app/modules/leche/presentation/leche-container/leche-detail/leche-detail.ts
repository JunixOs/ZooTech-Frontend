import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  output,
  effect,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { ButtonComponent } from '@shared/ui/button.component';
import { LecheRegistro, UpdateLecheRequest } from '@modules/leche/domain/models/leche.model';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';
import { AuthService } from '@core/auth/auth.service';
import { NombrePipe } from '@modules/leche/pipe/nombre-pipe';

@Component({
  selector: 'zt-leche-detail',
  standalone: true,
  imports: [DecimalPipe, FormsModule, TranslatePipe, ModalComponent, ButtonComponent, NombrePipe],
  templateUrl: './leche-detail.html',
  styleUrl: './leche-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheDetail {
  private readonly facade = inject(LecheFacade);
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);

  registroId = input<number | null>(null);
  close = output<void>();

  registro = signal<LecheRegistro | null>(null);
  historial = signal<LecheRegistro[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  isEditing = signal<boolean>(false);
  isDeleteModalOpen = signal(false);
  deleteReason = signal('');

  constructor() {
    effect(() => {
      const id = this.registroId();
      if (id === null) return;
      this.cargarDetalle(id);
    });
  }

  async cargarDetalle(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.facade.cargarRegistroPorId(String(id));
      this.registro.set(data);
      await this.facade.cargarRegistros();

      const todos = this.facade.registros();
      this.historial.set(todos);
    } catch (err) {
      this.error.set(this.translate.instant('leche.detail.errors.loadDetailFailed'));
      console.error('LecheDetail.cargarDetalle:', err);
    } finally {
      this.loading.set(false);
    }
  }

  abrirModalEliminar(): void {
    const reg = this.registro();
    if (!reg || !reg.id) return;

    this.error.set(null);
    this.deleteReason.set('');
    this.isDeleteModalOpen.set(true);
  }

  cerrarModalEliminar(): void {
    if (this.loading()) return;

    this.isDeleteModalOpen.set(false);
    this.deleteReason.set('');
  }

  async confirmarEliminarRegistro(): Promise<void> {
    const reg = this.registro();
    if (!reg || !reg.id) return;

    const motivo = this.deleteReason().trim();
    if (!motivo) {
      this.error.set('leche.detail.delete.reasonRequired');
      return;
    }

    this.loading.set(true);
    try {
      await this.facade.eliminarRegistro(String(reg.id), motivo);
      this.isDeleteModalOpen.set(false);
      this.deleteReason.set('');
      this.loading.set(false);
      this.volver();
    } catch (err) {
      this.error.set(this.translate.instant('leche.detail.errors.deleteFailed'));
      console.error('LecheDetail.eliminarRegistro:', err);
      this.loading.set(false);
    }
  }

  toggleEditar(): void {
    this.isEditing.set(!this.isEditing());
  }

  async guardarCambios(): Promise<void> {
    const reg = this.registro();
    if (!reg || !reg.id) return;

    this.loading.set(true);
    try {
      const payload: UpdateLecheRequest = {
        fechaHora: String(reg['fechaHora'] ?? ''),
        encargadoUsuarioId: String(reg['encargadoUsuarioId'] ?? 1) || undefined,
        litros: reg.litros,
        estadoOrdenioCode: String(reg['estadoOrdenioCode'] ?? 'ACTIVO'),
        observaciones: String(reg['observaciones'] ?? ''),
      };

      await this.facade.actualizarRegistro(String(reg.id), payload);
      this.isEditing.set(false);
      await this.cargarDetalle(reg.id);
      this.loading.set(false);
    } catch (err) {
      this.error.set(this.translate.instant('leche.detail.errors.updateFailed'));
      console.error('LecheDetail.guardarCambios:', err);
      this.loading.set(false);
    }
  }

  cancelarEdicion(): void {
    this.isEditing.set(false);
    const id = this.registro()?.id;
    if (id) this.cargarDetalle(id);
  }

  onLitrosChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const reg = this.registro();
    if (reg) {
      reg.litros = parseFloat(value) || 0;
      this.registro.set({ ...reg });
    }
  }

  onObservacionesChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    const reg = this.registro();
    if (reg) {
      reg['observaciones'] = value;
      this.registro.set({ ...reg });
    }
  }

  volver(): void {
    this.close.emit();
  }
}
