import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import {
  EstadoFecundacion,
  EstadoFecundacionVacuno,
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
export class EstadoFecundacionComponent {
  private readonly estadoService = inject(EstadoFecundacionService);

  readonly estadosPermitidos: EstadoFecundacion[] = [
    'pendiente',
    'en_proceso',
    'confirmada',
    'en_gestacion',
    'fallida',
    'sin_estado',
  ];

  readonly busqueda = signal('');
  readonly codigoSeleccionado = signal('VCH-001');
  readonly estadoSeleccionado = signal<EstadoFecundacion>('pendiente');
  readonly guardado = signal(false);
  readonly vacunos = signal<EstadoFecundacionVacuno[]>(this.estadoService.listarVacunosHembra());

  readonly vacunosFiltrados = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    if (!term) return this.vacunos();

    return this.estadoService.buscarVacunosHembra(term);
  });

  readonly vacunoSeleccionado = computed(() =>
    this.vacunos().find((vacuno) => vacuno.codigoVacuno === this.codigoSeleccionado()) ?? null,
  );

  readonly disponibleNuevaFecundacion = computed(() =>
    this.estadoService.esDisponibleParaNuevaFecundacion(
      this.vacunoSeleccionado()?.estadoReproductivoActual ?? 'sin_estado',
    ),
  );

  constructor() {
    const seleccionado = this.vacunoSeleccionado();
    if (seleccionado) {
      this.estadoSeleccionado.set(seleccionado.estadoReproductivoActual);
    }
  }

  actualizarBusqueda(value: string): void {
    this.busqueda.set(value);
  }

  seleccionarVacuno(codigoVacuno: string): void {
    const vacuno = this.vacunos().find((item) => item.codigoVacuno === codigoVacuno);
    if (!vacuno) return;

    this.codigoSeleccionado.set(vacuno.codigoVacuno);
    this.estadoSeleccionado.set(vacuno.estadoReproductivoActual);
    this.guardado.set(false);
  }

  actualizarEstado(value: EstadoFecundacion): void {
    this.estadoSeleccionado.set(value);
    this.guardado.set(false);
  }

  guardarEstado(): void {
    const seleccionado = this.vacunoSeleccionado();
    if (!seleccionado) return;

    const nuevoEstado = this.estadoSeleccionado();
    this.estadoService.actualizarEstado(seleccionado.codigoVacuno, nuevoEstado);
    this.vacunos.set(this.estadoService.listarVacunosHembra());
    this.guardado.set(true);
  }
}
