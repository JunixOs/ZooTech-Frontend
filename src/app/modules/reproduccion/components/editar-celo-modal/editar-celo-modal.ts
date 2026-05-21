import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface CeloEditable {
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string;
  vecesEnCelo: number;
}

export interface EditarCeloForm {
  codigoRegistro: string;
  fecha: string;
  hora: string;
  observaciones: string;
  caracteristicaCodes: string[];
}

@Component({
  selector: 'zt-editar-celo-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-celo-modal.html',
  styleUrl: './editar-celo-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarCeloModal {
  abierto = input(false);
  registro = input<CeloEditable | null>(null);

  cerrar = output<void>();
  guardar = output<EditarCeloForm>();
  eliminar = output<CeloEditable>();

  modoEdicion = signal(false);
  form: EditarCeloForm = this.crearFormVacio();
  responsable = 'Aracely Gonzales';

  caracteristicas = [
    { code: 'MUGE', nombre: 'Mugido persistente' },
    { code: 'SECRECION', nombre: 'Secrecion vulvar' },
    { code: 'INQUIETA', nombre: 'Inquietud' },
    { code: 'MONTADA', nombre: 'Se deja montar' },
    { code: 'MONTA_OTRAS', nombre: 'Monta a otras vacas' },
    { code: 'VULVA_INFLAMADA', nombre: 'Vulva inflamada' },
  ];

  historial = [
    { numero: 1, fecha: '2026-04-10', resultado: 'Confirmado', exitoso: true },
    { numero: 2, fecha: '2026-04-30', resultado: 'Sin monta', exitoso: false },
    { numero: 3, fecha: '2026-05-10', resultado: 'Actual', exitoso: true },
  ];

  estadisticas = [
    { etiqueta: 'Celos', valor: 5 },
    { etiqueta: 'Embarazos', valor: 2 },
    { etiqueta: 'Fecundaciones', valor: 3 },
    { etiqueta: 'Crias', valor: 2 },
    { etiqueta: 'Montas', valor: 4 },
    { etiqueta: 'Inseminaciones', valor: 1 },
    { etiqueta: 'Ultimo parto', valor: '2025-11-18' },
  ];

  constructor() {
    effect(() => {
      const registro = this.registro();
      if (!registro) {
        this.form = this.crearFormVacio();
        this.modoEdicion.set(false);
        return;
      }

      this.modoEdicion.set(false);
      this.form = {
        codigoRegistro: registro.codigoRegistro,
        fecha: registro.fecha,
        hora: registro.hora,
        observaciones: '',
        caracteristicaCodes: ['MUGE', 'INQUIETA'],
      };
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }

  activarEdicion(): void {
    this.modoEdicion.set(true);
  }

  cancelarEdicion(): void {
    this.modoEdicion.set(false);
  }

  toggleCaracteristica(code: string, checked: boolean): void {
    if (checked && !this.form.caracteristicaCodes.includes(code)) {
      this.form = {
        ...this.form,
        caracteristicaCodes: [...this.form.caracteristicaCodes, code],
      };
      return;
    }

    if (!checked) {
      this.form = {
        ...this.form,
        caracteristicaCodes: this.form.caracteristicaCodes.filter((item) => item !== code),
      };
    }
  }

  nombreCaracteristica(code: string): string {
    return this.caracteristicas.find((item) => item.code === code)?.nombre ?? code;
  }

  onGuardar(): void {
    this.guardar.emit({ ...this.form });
  }

  onEliminar(): void {
    const registro = this.registro();
    if (registro) {
      this.eliminar.emit(registro);
    }
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
