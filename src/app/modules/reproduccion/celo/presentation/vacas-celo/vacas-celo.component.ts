import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { RegistrarCeloRequest } from '@modules/reproduccion/celo/domain/models/celo.model';
import { CeloApiService } from '@modules/reproduccion/celo/infrastructure/celo-api.service';

type EstadoCelo = 'enCelo' | 'proximo' | 'paso';
type SubmitMessageType = 'success' | 'error';

interface VacaCelo {
  id: number;
  codigo: string;
  nombre: string;
  diasRestante: number;
  estado: EstadoCelo;
  vecesEnCelo: number;
  crias: number;
}

interface CaracteristicaCelo {
  code: string;
  labelKey?: string;
  nombre?: string;
}

const DEFAULT_ENCARGADO_USUARIO_ID = 1;

const MOCK_VACAS: VacaCelo[] = [
  {
    id: 1,
    codigo: 'VAC-001',
    nombre: 'Clara',
    diasRestante: 2,
    estado: 'proximo',
    vecesEnCelo: 2,
    crias: 1,
  },
  {
    id: 2,
    codigo: 'VAC-002',
    nombre: 'Bella',
    diasRestante: 0,
    estado: 'enCelo',
    vecesEnCelo: 4,
    crias: 2,
  },
  {
    id: 3,
    codigo: 'VAC-003',
    nombre: 'Rosa',
    diasRestante: 15,
    estado: 'paso',
    vecesEnCelo: 3,
    crias: 0,
  },
  {
    id: 4,
    codigo: 'VAC-004',
    nombre: 'Daisy',
    diasRestante: 5,
    estado: 'proximo',
    vecesEnCelo: 1,
    crias: 0,
  },
  {
    id: 5,
    codigo: 'VAC-005',
    nombre: 'Luna',
    diasRestante: 0,
    estado: 'enCelo',
    vecesEnCelo: 5,
    crias: 3,
  },
];

const DEFAULT_CARACTERISTICAS: CaracteristicaCelo[] = [
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
];

@Component({
  selector: 'zt-vacas-celo',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './vacas-celo.component.html',
  styleUrl: './vacas-celo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacasCeloComponent {
  private readonly celoApiService = inject(CeloApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly vacas = signal<VacaCelo[]>(MOCK_VACAS);
  readonly vacasFiltradas = signal<VacaCelo[]>(MOCK_VACAS);
  readonly caracteristicas = signal<CaracteristicaCelo[]>(DEFAULT_CARACTERISTICAS);
  readonly mostrarModalNuevoCelo = signal(false);
  readonly mostrarDropdownVacunos = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitMessageKey = signal<string | null>(null);
  readonly submitMessageType = signal<SubmitMessageType>('success');

  textoBusquedaVacuno = '';
  textoOtraCaracteristica = '';
  nuevoCelo: RegistrarCeloRequest = this.createEmptyCeloRequest();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.buscador-vacuno-container')) {
      this.mostrarDropdownVacunos.set(false);
    }
  }

  abrirModalNuevoCelo(): void {
    this.resetNuevoCelo();
    this.mostrarModalNuevoCelo.set(true);
  }

  cerrarModalNuevoCelo(): void {
    this.mostrarModalNuevoCelo.set(false);
  }

  onBusquedaVacunoChange(): void {
    const term = this.textoBusquedaVacuno.toLowerCase().trim();
    const vacas = this.vacas();
    const filtered = term
      ? vacas.filter(
          (vaca) =>
            vaca.codigo.toLowerCase().includes(term) || vaca.nombre.toLowerCase().includes(term),
        )
      : vacas;

    this.vacasFiltradas.set(filtered);
    this.mostrarDropdownVacunos.set(true);
  }

  toggleDropdownVacunos(event: Event): void {
    event.stopPropagation();
    this.mostrarDropdownVacunos.update((value) => !value);
    if (this.mostrarDropdownVacunos()) {
      this.vacasFiltradas.set(this.vacas());
    }
  }

  seleccionarVacuno(vaca: VacaCelo): void {
    this.nuevoCelo = { ...this.nuevoCelo, vacunoId: vaca.id };
    this.textoBusquedaVacuno = `${vaca.codigo} - ${vaca.nombre}`;
    this.mostrarDropdownVacunos.set(false);
  }

  cambiarCaracteristica(code: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const codes = this.nuevoCelo.caracteristicaCodes;
    const nextCodes = isChecked
      ? Array.from(new Set([...codes, code]))
      : codes.filter((currentCode) => currentCode !== code);

    this.nuevoCelo = { ...this.nuevoCelo, caracteristicaCodes: nextCodes };
  }

  agregarOtraCaracteristica(): void {
    const nombre = this.textoOtraCaracteristica.trim();
    if (!nombre) return;

    const existing = this.caracteristicas().find(
      (item) => this.getCaracteristicaLabel(item).toLowerCase() === nombre.toLowerCase(),
    );

    if (existing) {
      this.nuevoCelo = {
        ...this.nuevoCelo,
        caracteristicaCodes: Array.from(
          new Set([...this.nuevoCelo.caracteristicaCodes, existing.code]),
        ),
      };
      this.textoOtraCaracteristica = '';
      return;
    }

    const code = `CUSTOM_${Date.now()}`;
    this.caracteristicas.update((items) => [...items, { code, nombre }]);
    this.nuevoCelo = {
      ...this.nuevoCelo,
      caracteristicaCodes: [...this.nuevoCelo.caracteristicaCodes, code],
    };
    this.textoOtraCaracteristica = '';
  }

  guardarNuevoCelo(): void {
    this.submitMessageKey.set(null);

    if (!this.nuevoCelo.vacunoId) {
      this.setSubmitMessage('reproduccion.celo.vacas.modal.validation.vacunoRequired', 'error');
      return;
    }

    if (!this.nuevoCelo.fechaHora) {
      this.setSubmitMessage('reproduccion.celo.vacas.modal.validation.dateRequired', 'error');
      return;
    }

    this.isSubmitting.set(true);
    this.celoApiService
      .registrarCelo(this.nuevoCelo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.setSubmitMessage('reproduccion.celo.vacas.modal.messages.saved', 'success');
          this.cerrarModalNuevoCelo();
          this.resetNuevoCelo();
        },
        error: (err: Error) => {
          console.error('[VacasCelo] Error al registrar celo:', err.message);
          this.isSubmitting.set(false);
          this.setSubmitMessage('reproduccion.celo.vacas.modal.messages.error', 'error');
        },
      });
  }

  getEstadoKey(estado: EstadoCelo): string {
    return `reproduccion.celo.vacas.status.${estado}`;
  }

  getCaracteristicaLabel(item: CaracteristicaCelo): string {
    return item.nombre ?? item.labelKey ?? item.code;
  }

  private resetNuevoCelo(): void {
    this.nuevoCelo = this.createEmptyCeloRequest();
    this.textoBusquedaVacuno = '';
    this.textoOtraCaracteristica = '';
    this.vacasFiltradas.set(this.vacas());
    this.caracteristicas.set(DEFAULT_CARACTERISTICAS);
    this.mostrarDropdownVacunos.set(false);
    this.submitMessageKey.set(null);
  }

  private createEmptyCeloRequest(): RegistrarCeloRequest {
    return {
      vacunoId: 0,
      encargadoUsuarioId: DEFAULT_ENCARGADO_USUARIO_ID,
      fechaHora: this.getLocalDateTimeString(),
      observaciones: '',
      caracteristicaCodes: [],
    };
  }

  private getLocalDateTimeString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private setSubmitMessage(key: string, type: SubmitMessageType): void {
    this.submitMessageKey.set(key);
    this.submitMessageType.set(type);
  }
}
