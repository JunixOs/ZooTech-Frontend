import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VacunoListItem, VacunoFiltros, EstadoVacuno } from '../../domain/models/vacuno.model';

@Component({
  selector: 'app-vacuno-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vacuno-list.html',
  styleUrl: './vacuno-list.scss',
})
export class VacunoListComponent {
  readonly vacunos = input<VacunoListItem[]>([]);
  readonly cargando = input(false);
  readonly pagination = input({ page: 1, limit: 10, total: 0, totalPages: 1 });

  readonly onNuevo = output<void>();
  readonly onVerDetalle = output<number>();
  readonly onFiltrar = output<VacunoFiltros>();
  readonly onCambiarPagina = output<number>();

  readonly q = signal('');
  readonly raza = signal('');
  readonly estado = signal<EstadoVacuno | ''>('');

  aplicarFiltros(): void {
    this.onFiltrar.emit({
      page: 1, limit: 10,
      q: this.q() || undefined,
      raza: this.raza() || undefined,
      estado: this.estado() || undefined,
    });
  }

  filtrarEstado(e: EstadoVacuno): void {
    this.estado.set(this.estado() === e ? '' : e);
    this.aplicarFiltros();
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.pagination().totalPages) return;
    this.onCambiarPagina.emit(p);
  }

  formatearFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  get desde(): number { return (this.pagination().page - 1) * this.pagination().limit + 1; }
  get hasta(): number { return Math.min(this.pagination().page * this.pagination().limit, this.pagination().total); }
}
