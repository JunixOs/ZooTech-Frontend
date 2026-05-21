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
  private readonly deletedReasonsState = signal<Record<string, string>>({});

  readonly vacunos = computed(() => this.vacunosState());
  readonly total = computed(() => this.vacunosState().length);
  readonly deletedReasons = computed(() => this.deletedReasonsState());

  findByCodigo(codigo: string): Vacuno | undefined {
    return this.vacunosState().find((vacuno) => vacuno.codigo === codigo);
  }

  deleteByCodigo(codigo: string, reason: string): boolean {
    const exists = this.findByCodigo(codigo);

    if (!exists || !reason.trim()) {
      return false;
    }

    this.deletedReasonsState.update((current) => ({
      ...current,
      [codigo]: reason.trim(),
    }));
    this.vacunosState.update((vacunos) => vacunos.filter((vacuno) => vacuno.codigo !== codigo));

    return true;
  }

  formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
}
