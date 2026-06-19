import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  output,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LecheRegistro, UpdateLecheRequest } from '@modules/leche/domain/models/leche.model';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';

@Component({
  selector: 'zt-leche-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './leche-detail.html',
  styleUrl: './leche-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheDetail {
  private readonly facade = inject(LecheFacade);
  private readonly translate = inject(TranslateService);

  registroId = input<number | null>(null);
  close = output<void>();

  registro = signal<LecheRegistro | null>(null);
  historial = signal<LecheRegistro[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  isEditing = signal<boolean>(false);

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

  async eliminarRegistro(): Promise<void> {
    const reg = this.registro();
    if (!reg || !reg.id) return;

    const motivo = window.prompt(
      this.translate.instant('leche.detail.deletePrompt', { code: reg.codigoRegistro }),
      this.translate.instant('leche.detail.deleteDefaultReason'),
    );
    if (!motivo) return;

    this.loading.set(true);
    try {
      await this.facade.eliminarRegistro(String(reg.id), motivo);
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
        encargadoUsuarioId: Number(reg['encargadoUsuarioId'] ?? 0) || undefined,
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
