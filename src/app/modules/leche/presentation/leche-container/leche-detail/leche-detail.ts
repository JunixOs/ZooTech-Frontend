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
import { TranslatePipe } from '@ngx-translate/core';
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
      // Cargar el registro específico
      const data = await this.facade.cargarRegistroPorId(String(id));
      this.registro.set(data);

      // Cargar todos los registros para mostrar como historial
      await this.facade.cargarRegistros();
      const todos = this.facade.registros();
      this.historial.set(todos);
    } catch (err) {
      this.error.set('No se pudo cargar el detalle del registro.');
      console.error('LecheDetail.cargarDetalle:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async eliminarRegistro(): Promise<void> {
    const reg = this.registro();
    if (!reg || !reg.id) return;

    const motivo = prompt(
      `¿Estás seguro de que deseas eliminar el registro ${reg.codigoRegistro}?\nIngresa el motivo de eliminación:`,
      'Eliminado por el usuario',
    );
    if (!motivo) return;

    this.loading.set(true);
    try {
      await this.facade.eliminarRegistro(String(reg.id), motivo);
      this.loading.set(false);
      this.volver();
    } catch (err) {
      this.error.set('No se pudo eliminar el registro.');
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
      this.error.set('No se pudo actualizar el registro.');
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
