import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import {
  ESTADOS_FECUNDACION_PERMITIDOS,
  EstadoFecundacion,
} from '../../domain/models/fecundacion.model';
import { EstadoFecundacionService } from '../../application/services/estado-fecundacion.service';

@Component({
  selector: 'zt-estado-fecundacion',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './estado-fecundacion.html',
  styleUrl: './estado-fecundacion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoFecundacionComponent implements OnInit {
  private readonly estadoService = inject(EstadoFecundacionService);

  readonly estadosPermitidos = ESTADOS_FECUNDACION_PERMITIDOS;
  readonly busqueda = signal('');
  readonly vacunoIdSeleccionado = signal<number | string | null>(null);
  readonly estadoSeleccionado = signal<EstadoFecundacion>('sin_estado');

  readonly loading = this.estadoService.loading;
  readonly saving = this.estadoService.saving;
  readonly error = this.estadoService.error;
  readonly saveMessage = this.estadoService.saveMessage;
  readonly vacunos = this.estadoService.vacunosHembra;
  readonly vacunoSeleccionado = this.estadoService.estadoActual;

  readonly vacunosFiltrados = computed(() => this.estadoService.buscarVacunosHembra(this.busqueda()));

  readonly disponibleNuevaFecundacion = computed(() =>
    this.estadoService.esDisponibleParaNuevaFecundacion(
      this.vacunoSeleccionado()?.estadoReproductivoActual ?? 'sin_estado',
    ),
  );

  readonly puedeGuardar = computed(() => Boolean(this.vacunoSeleccionado()?.fecundacionId) && !this.saving());

  async ngOnInit(): Promise<void> {
    await this.estadoService.cargarVacunosHembra();
    const primerVacuno = this.vacunos()[0];

    if (primerVacuno) {
      this.vacunoIdSeleccionado.set(primerVacuno.id);
    }

    this.sincronizarEstadoEditable();
  }

  actualizarBusqueda(value: string): void {
    this.busqueda.set(value);
  }

  async seleccionarVacuno(vacunoId: number | string): Promise<void> {
    this.vacunoIdSeleccionado.set(vacunoId);
    await this.estadoService.consultarEstado(vacunoId);
    this.sincronizarEstadoEditable();
  }

  actualizarEstado(value: EstadoFecundacion): void {
    this.estadoSeleccionado.set(value);
  }

  async guardarEstado(): Promise<void> {
    await this.estadoService.actualizarEstado(this.estadoSeleccionado());
    this.sincronizarEstadoEditable();
  }

  private sincronizarEstadoEditable(): void {
    this.estadoSeleccionado.set(this.vacunoSeleccionado()?.estadoReproductivoActual ?? 'sin_estado');
  }
}
