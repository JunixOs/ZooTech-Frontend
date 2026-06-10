import { Injectable, computed, signal } from '@angular/core';
import { Vacuno, VacunoEstado } from '../domain/models/vacuno.model';
import { VACUNOS_MOCK } from '../infrastructure/vacunos.mock';

export interface VacunoFilters {
  search: string;
  estado: VacunoEstado | 'Todos';
  fechaDesde: string;
  fechaHasta: string;
}

export interface ActivityDateRange {
  fechaInicio: string;
  fechaFin: string;
}

export interface VacunoActivityPoint {
  fecha: string;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class VacunoService {
  private readonly vacunosState = signal<Vacuno[]>(VACUNOS_MOCK);

  readonly vacunos = computed(() => this.vacunosState());
  readonly total = computed(() => this.vacunosState().length);

  findByCodigo(codigo: string): Vacuno | undefined {
    return this.vacunosState().find((vacuno) => vacuno.codigo === codigo);
  }

  filter(filters: VacunoFilters): Vacuno[] {
    const search = filters.search.trim().toLowerCase();
    const desde = filters.fechaDesde ? new Date(filters.fechaDesde).getTime() : null;
    const hasta = filters.fechaHasta ? new Date(filters.fechaHasta).getTime() : null;

    return this.vacunosState().filter((vacuno) => {
      const fecha = new Date(vacuno.fechaNacimiento).getTime();
      const matchesEstado = filters.estado === 'Todos' || vacuno.estado === filters.estado;
      const matchesDesde = desde === null || fecha >= desde;
      const matchesHasta = hasta === null || fecha <= hasta;
      const matchesSearch =
        search.length === 0 ||
        [
          vacuno.codigo,
          vacuno.nombre,
          vacuno.raza,
          vacuno.granja,
          vacuno.departamento,
          vacuno.provincia,
          vacuno.distrito,
          vacuno.estado,
        ]
          .join(' ')
          .toLowerCase()
          .includes(search);

      return matchesEstado && matchesDesde && matchesHasta && matchesSearch;
    });
  }

  getDefaultActivityRange(referenceDate = new Date()): ActivityDateRange {
    const fechaFin = new Date(referenceDate);
    const fechaInicio = new Date(referenceDate);
    fechaInicio.setDate(fechaInicio.getDate() - 29);

    return {
      fechaInicio: this.toDateInput(fechaInicio),
      fechaFin: this.toDateInput(fechaFin),
    };
  }

  getActivitySeries(fechaInicio: string, fechaFin: string): VacunoActivityPoint[] {
    const fallback = this.getDefaultActivityRange();
    const start = this.parseDateInput(fechaInicio) ?? this.parseDateInput(fallback.fechaInicio)!;
    const end = this.parseDateInput(fechaFin) ?? this.parseDateInput(fallback.fechaFin)!;
    const normalizedStart = start.getTime() <= end.getTime() ? start : end;
    const normalizedEnd = start.getTime() <= end.getTime() ? end : start;
    const totalDays = Math.min(this.diffDays(normalizedStart, normalizedEnd), 120);

    return Array.from({ length: totalDays + 1 }, (_, index) => {
      const current = this.addDays(normalizedStart, index);
      const wave = Math.sin(index * 0.72) * 4 + Math.cos(index * 0.23) * 2;
      const trend = Math.round((index % 12) / 2);
      const recurringPeak = index % 8 === 0 ? 4 : 0;
      const recurringDrop = index % 11 === 0 ? -5 : 0;
      const base = 8 + Math.round(wave) + trend + recurringPeak + recurringDrop;

      return {
        fecha: this.toDateInput(current),
        cantidad: Math.max(1, Math.min(19, base)),
      };
    });
  }

  formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  private parseDateInput(value: string): Date | null {
    const parts = value.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return null;
    }

    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  private toDateInput(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private addDays(value: Date, days: number): Date {
    const next = new Date(value);
    next.setDate(next.getDate() + days);
    return next;
  }

  private diffDays(start: Date, end: Date): number {
    const millisecondsByDay = 24 * 60 * 60 * 1000;
    return Math.round((end.getTime() - start.getTime()) / millisecondsByDay);
  }
}
