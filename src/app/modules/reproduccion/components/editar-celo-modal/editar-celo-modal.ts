import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

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
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './editar-celo-modal.html',
  styleUrl: './editar-celo-modal.css',
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
  responsableKey = 'reproduccion.celo.editModal.defaultUser';

  caracteristicas = [
    { code: 'MUGE', labelKey: 'reproduccion.celo.vacas.modal.characteristics.muge' },
    { code: 'SECRECION', labelKey: 'reproduccion.celo.vacas.modal.characteristics.secrecion' },
    { code: 'INQUIETA', labelKey: 'reproduccion.celo.vacas.modal.characteristics.inquieta' },
    { code: 'MONTADA', labelKey: 'reproduccion.celo.vacas.modal.characteristics.montada' },
    { code: 'MONTA_OTRAS', labelKey: 'reproduccion.celo.vacas.modal.characteristics.montaOtras' },
    {
      code: 'VULVA_INFLAMADA',
      labelKey: 'reproduccion.celo.vacas.modal.characteristics.vulvaInflamada',
    },
  ];

  historial = [
    {
      numero: 1,
      fecha: '2026-04-10',
      resultadoKey: 'reproduccion.celo.editModal.results.confirmed',
      exitoso: true,
    },
    {
      numero: 2,
      fecha: '2026-04-30',
      resultadoKey: 'reproduccion.celo.editModal.results.noMount',
      exitoso: false,
    },
    {
      numero: 3,
      fecha: '2026-05-10',
      resultadoKey: 'reproduccion.celo.editModal.results.current',
      exitoso: true,
    },
  ];

  estadisticas = [
    { labelKey: 'reproduccion.celo.editModal.stats.heats', valor: 5 },
    { labelKey: 'reproduccion.celo.editModal.stats.pregnancies', valor: 2 },
    { labelKey: 'reproduccion.celo.editModal.stats.fertilizations', valor: 3 },
    { labelKey: 'reproduccion.celo.editModal.stats.offspring', valor: 2 },
    { labelKey: 'reproduccion.celo.editModal.stats.mounts', valor: 4 },
    { labelKey: 'reproduccion.celo.editModal.stats.inseminations', valor: 1 },
    { labelKey: 'reproduccion.celo.editModal.stats.lastBirth', valor: '2025-11-18' },
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
    return this.caracteristicas.find((item) => item.code === code)?.labelKey ?? code;
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
