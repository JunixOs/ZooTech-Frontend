import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  HistorialCeloPorVacuno,
  ResumenCeloPorVacuno,
} from '@modules/reproduccion/celo/domain/models/reporte-celo-vacuno.model';

export interface CeloEditable {
  id?: number;
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string;
  vecesEnCelo: number;
  observaciones?: string | null;
  caracteristicaCodes?: string[];

  motivoEliminacion?: string;
}

export interface EditarCeloForm {
  codigoRegistro: string;
  fecha: string;
  hora: string;
  observaciones: string;
  caracteristicaCodes: string[];
}

interface CeloEstadisticaItem {
  labelKey: string;
  valor: string | number;
}

@Component({
  selector: 'zt-editar-celo-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './editar-celo-modal.html',
  styleUrl: './editar-celo-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarCeloModal {
  abierto = input(false);
  registro = input<CeloEditable | null>(null);
  historial = input<HistorialCeloPorVacuno[]>([]);
  resumen = input<ResumenCeloPorVacuno | null>(null);
  encargado = input<string | null>(null);
  historialLoading = input(false);
  historialError = input<string | null>(null);

  cerrar = output<void>();
  guardar = output<EditarCeloForm>();
  eliminar = output<CeloEditable>();

  modoEdicion = signal(false);
  mostrarModalEliminar = signal(false);
  motivoEliminacion = '';
  errorMensaje = signal<string | null>(null);

  form = signal<EditarCeloForm>(this.crearFormVacio());
  caracteristicas = signal<{ code: string; labelKey: string }[]>([
    { code: 'MUGE', labelKey: 'reproduccion.celo.vacas.modal.characteristics.muge' },
    { code: 'SECRECION', labelKey: 'reproduccion.celo.vacas.modal.characteristics.secrecion' },
    { code: 'INQUIETA', labelKey: 'reproduccion.celo.vacas.modal.characteristics.inquieta' },
    { code: 'MONTADA', labelKey: 'reproduccion.celo.vacas.modal.characteristics.montada' },
    { code: 'MONTA_OTRAS', labelKey: 'reproduccion.celo.vacas.modal.characteristics.montaOtras' },
    {
      code: 'VULVA_INFLAMADA',
      labelKey: 'reproduccion.celo.vacas.modal.characteristics.vulvaInflamada',
    },
    { code: 'OTROS', labelKey: 'reproduccion.celo.vacas.modal.characteristics.otros' },
  ]);
  estadisticas = signal<CeloEstadisticaItem[]>([]);

  constructor() {
    effect(() => {
      const registro = this.registro();
      this.errorMensaje.set(null);

      if (!registro) {
        this.form.set(this.crearFormVacio());
        this.modoEdicion.set(false);
        return;
      }

      this.modoEdicion.set(false);
      this.form.set({
        codigoRegistro: registro.codigoRegistro,
        fecha: registro.fecha,
        hora: registro.hora,
        observaciones: registro.observaciones ?? '',
        caracteristicaCodes: [...(registro.caracteristicaCodes ?? [])],
      });
    });
  }

  setErrorMessage(msgKeyOrText: string | null): void {
    this.errorMensaje.set(msgKeyOrText);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }

  activarEdicion(): void {
    this.modoEdicion.set(true);
    this.errorMensaje.set(null);
  }

  cancelarEdicion(): void {
    this.modoEdicion.set(false);
    this.errorMensaje.set(null);
  }

  toggleCaracteristica(code: string, checked: boolean): void {
    if (checked && !this.form().caracteristicaCodes.includes(code)) {
      this.form.update((f) => ({
        ...f,
        caracteristicaCodes: [...f.caracteristicaCodes, code],
      }));
      return;
    }

    if (!checked) {
      this.form.update((f) => ({
        ...f,
        caracteristicaCodes: f.caracteristicaCodes.filter((item) => item !== code),
      }));
    }
  }

  nombreCaracteristica(code: string): string {
    return this.caracteristicas().find((item) => item.code === code)?.labelKey ?? code;
  }

  formatFecha(value: string | null | undefined): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE');
  }

  onGuardar(): void {
    if (this.form().caracteristicaCodes.length === 0) {
      this.errorMensaje.set('reproduccion.celo.vacas.modal.validation.characteristicsRequired');
      return;
    }

    this.errorMensaje.set(null);
    this.guardar.emit({ ...this.form() });
  }

  onEliminar(): void {
    this.mostrarModalEliminar.set(true);
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminar.set(false);
    this.motivoEliminacion = '';
  }
  confirmarEliminacion(): void {
      const registro = this.registro();

      if (!registro) {
        return;
      }

      if (!this.motivoEliminacion.trim()) {
        return;
      }

      this.eliminar.emit({
        ...registro,
        motivoEliminacion: this.motivoEliminacion,
      } as CeloEditable);

      this.mostrarModalEliminar.set(false);
      this.motivoEliminacion = '';
    }

  updateFecha(value: string): void {
    this.form.update((f) => ({ ...f, fecha: value }));
  }

  updateHora(value: string): void {
    this.form.update((f) => ({ ...f, hora: value }));
  }

  updateObservaciones(value: string): void {
    this.form.update((f) => ({ ...f, observaciones: value }));
  }

  private crearFormVacio(): EditarCeloForm {
    return {
      codigoRegistro: '',
      fecha: '',
      hora: '',
      observaciones: '',
      caracteristicaCodes: [],
    };
  }
}
