import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { TriajeRepository } from '@modules/sanidad/domain/interfaces/triaje-repository.interface';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import {
  TriajeRegistro,
  RegistrarTriajePayload,
  ActualizarTriajePayload,
  EliminarTriajePayload,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
  TriajeHistorialItem,
  ConsultaFiltros,
} from '@modules/sanidad/domain/models/triaje.model';

@Injectable({ providedIn: 'root' })
export class TriajeFacade {
  private readonly repository = inject(TriajeRepository);
  private readonly filtroService = inject(ReporteFiltroService);

  private readonly _triajes = signal<TriajeRegistro[]>([]);
  private readonly _totalPaginas = signal(0);
  private readonly _totalItems = signal(0);
  private readonly _paginaActual = signal(1);
  private readonly _limitePorPagina = signal(10);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  private readonly _filtros = signal<Record<string, string>>({});
  private readonly _filtroBusqueda = signal('');

  readonly triajes = this._triajes.asReadonly();
  readonly totalPaginas = this._totalPaginas.asReadonly();
  readonly totalItems = this._totalItems.asReadonly();
  readonly paginaActual = this._paginaActual.asReadonly();
  readonly limitePorPagina = this._limitePorPagina.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filtros = this._filtros.asReadonly();

  readonly tiposPeso = signal<TriajeTipoPesoOption[]>([]);
  readonly vacunos = signal<TriajeVacunoOption[]>([]);

 private buildFiltros(page: number = this._paginaActual()): ConsultaFiltros {
  const f = this._filtros();

  return {
    page,
    pageSize: this._limitePorPagina(),
    fecha: this.parseEsPeDateToIso(f['fechaHora']),
    fechaDesde: f['fechaInicio'] || this.filtroService.fechaDesde(),
    fechaHasta: f['fechaFin'] || this.filtroService.fechaHasta(),
    vacunoId: f['vacunoId'] || undefined,
    codigo: f['codigo'] || this._filtroBusqueda() || undefined,
    vacunoNombre: f['vacunoNombre'] || this.filtroService.nombre() || undefined,
    tipoPeso: f['tipoPesoCode'] || undefined,
    pesoKg: f['pesoKg'] ? Number(f['pesoKg']) : undefined,
  };
}
private parseEsPeDateToIso(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const partes = value.split('/');
  if (partes.length !== 3) return undefined;

  const [dia, mes, anio] = partes;
  if (!dia || !mes || !anio) return undefined;

  const diaPad = dia.padStart(2, '0');
  const mesPad = mes.padStart(2, '0');

  return `${anio}-${mesPad}-${diaPad}`;
}

  cargarCatalogos(): void {
    this.repository.getTiposPeso().subscribe((data) => this.tiposPeso.set(data));
    this.repository.getVacunos().subscribe((data) => this.vacunos.set(data));
  }

  cargarPagina(page: number = this._paginaActual()): void {
    this._loading.set(true);
    this._error.set(null);

    this.repository
      .getAll(this.buildFiltros(page)).subscribe({
        next: (response) => {
          this._triajes.set(response.items);
          this._totalItems.set(response.totalItems);
          this._totalPaginas.set(response.totalPaginas);
          this._paginaActual.set(response.paginaActual);
          this._limitePorPagina.set(response.limitePorPagina);
          this._loading.set(false);
        },
        error: () => {
          this._error.set('Error al cargar los triajes');
          this._loading.set(false);
        },
      });
  }

  cambiarLimite(limit: number): void {
    this._limitePorPagina.set(limit);
    this._paginaActual.set(1);
    this.cargarPagina(1);
  }

  cargarPorVacuno(vacunoId: number): void {
    this._filtros.set({ vacunoId: String(vacunoId) });
    this._paginaActual.set(1);
    this.cargarPagina(1);
  }

  actualizarFiltros(filters: Record<string, string>): void {
    this._filtros.set(filters);
    this._paginaActual.set(1);
    this.cargarPagina(1);
  }

  actualizarBusqueda(q: string): void {
    this._filtroBusqueda.set(q);
    this._paginaActual.set(1);
    this.cargarPagina(1);
  }

  getById(id: number): Observable<TriajeRegistro> {
    return this.repository.getById(id);
  }

  getHistorialByVacunoId(vacunoId: number): Observable<TriajeHistorialItem[]> {
    return this.repository.getHistorialByVacunoId(vacunoId);
  }

  create(payload: RegistrarTriajePayload): Observable<TriajeRegistro> {
    return this.repository.create(payload);
  }

  update(id: number, payload: ActualizarTriajePayload): Observable<void> {
    return this.repository.update(id, payload);
  }

  delete(id: number, payload: EliminarTriajePayload): Observable<void> {
    return this.repository.delete(id, payload);
  }


descargar(format: 'excel' | 'pdf'): Observable<Blob> {
  const filtros = this.buildFiltros();
  return format === 'excel'
    ? this.repository.downloadExcel(filtros)
    : this.repository.downloadPdf(filtros);
}

}
