import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { EstadoFecundacionService } from '../../application/services/estado-fecundacion.service';

@Component({
  selector: 'zt-estado-fecundacion',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './estado-fecundacion.html',
  styleUrl: './estado-fecundacion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoFecundacion implements OnInit, OnDestroy {
  private readonly estadoService = inject(EstadoFecundacionService);
  private searchDebounceId: ReturnType<typeof setTimeout> | null = null;

  readonly busqueda = signal('');
  readonly vacunoIdSeleccionado = signal<number | string | null>(null);
  readonly estadoSeleccionado = signal('');

  readonly loading = this.estadoService.loading;
  readonly saving = this.estadoService.saving;
  readonly error = this.estadoService.error;
  readonly saveMessage = this.estadoService.saveMessage;
  readonly estados = this.estadoService.estados;
  readonly vacunoSeleccionado = this.estadoService.estadoActual;

  readonly vacunosFiltrados = this.estadoService.vacunosHembra;

  readonly disponibleNuevaFecundacion = computed(() =>
    this.estadoService.esDisponibleParaNuevaFecundacion(
      this.vacunoSeleccionado()?.estadoReproductivoActual ?? 'SIN_ESTADO',
    ),
  );

  readonly estadoActualCode = computed(() =>
    this.getEstadoCode(this.vacunoSeleccionado()?.estadoReproductivoActual ?? ''),
  );

  readonly puedeGuardar = computed(() => {
    const actual = this.vacunoSeleccionado();
    return Boolean(actual?.fecundacionId) &&
      Boolean(this.estadoSeleccionado()) &&
      this.estadoSeleccionado() !== this.estadoActualCode() &&
      !this.saving();
  });

  async ngOnInit(): Promise<void> {
    await this.estadoService.cargarInicial();
    const actual = this.vacunoSeleccionado();
    this.vacunoIdSeleccionado.set(actual?.vacunoId ?? null);
    this.sincronizarEstadoEditable();
  }

  actualizarBusqueda(value: string): void {
    this.busqueda.set(value);
    this.clearSearchDebounce();
    this.searchDebounceId = setTimeout(() => {
      void this.estadoService.buscarVacunosHembra(value);
      this.searchDebounceId = null;
    }, 300);
  }

  async seleccionarVacuno(vacunoId: number | string): Promise<void> {
    this.vacunoIdSeleccionado.set(vacunoId);
    await this.estadoService.consultarEstado(vacunoId);
    this.sincronizarEstadoEditable();
  }

  actualizarEstado(value: string): void {
    this.estadoSeleccionado.set(value);
  }

  async guardarEstado(): Promise<void> {
    await this.estadoService.actualizarEstado(this.estadoSeleccionado());
    this.sincronizarEstadoEditable();
  }

  ngOnDestroy(): void {
    this.clearSearchDebounce();
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-PE');
  }

  estadoReproductivoLabel(value: string): string {
    return this.esSinEstado(value) ? 'reproduccion.fecundacion.estado.emptyStatus' : value;
  }

  private sincronizarEstadoEditable(): void {
    this.estadoSeleccionado.set(this.estadoActualCode());
  }

  private clearSearchDebounce(): void {
    if (this.searchDebounceId) {
      clearTimeout(this.searchDebounceId);
      this.searchDebounceId = null;
    }
  }

  private getEstadoCode(value: string): string {
    const normalized = this.normalize(value);
    const estado = this.estados().find((item) =>
      this.normalize(item.code) === normalized || this.normalize(item.nombre) === normalized,
    );

    return estado?.code ?? value;
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private esSinEstado(value: string): boolean {
    const normalized = this.normalize(value);
    return normalized === 'sin estado' || normalized === 'sin_estado';
  }
}
