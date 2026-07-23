import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
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
  private readonly router = inject(Router);

  private readonly _triajes = signal<TriajeRegistro[]>([]);
  private readonly _totalPaginas = signal(0);
  private readonly _totalItems = signal(0);
  private readonly _paginaActual = signal(1);
  private readonly _limitePorPagina = signal(10);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  private readonly _filtros = signal<Record<string, string>>({});
  private readonly _filtroBusqueda = signal('');
  private readonly filterChanges = new Subject<Record<string, string>>();
  private loadRequestId = 0;

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

  constructor() {
    this.filterChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
      )
      .subscribe(() => this.cargarPagina(1));
  }

  private buildFiltros(page: number = this._paginaActual()): ConsultaFiltros {
    const f = this._filtros();
    const isReport = this.router.url.includes('/reportes');
    return {
      page,
      pageSize: this._limitePorPagina(),
      uniqueVacuno: f['uniqueVacuno'] === 'true' ? true : undefined,
      fecha: this.parseEsPeDateToIso(f['fechaHora']),
      fechaDesde: f['fechaInicio'] || (isReport ? this.filtroService.fechaDesde() : undefined),
      fechaHasta: f['fechaFin'] || (isReport ? this.filtroService.fechaHasta() : undefined),
      vacunoId: f['vacunoId'] || undefined,
      codigo: this.normalizeTextFilter(f['codigo']) || this.normalizeTextFilter(this._filtroBusqueda()),
      vacunoNombre: this.normalizeTextFilter(f['vacunoNombre']) || this.normalizeTextFilter(this.filtroService.nombre()),
      tipoPeso: this.normalizeTextFilter(f['tipoPesoCode']),
      pesoKg: this.normalizePesoFilter(f['pesoKg']),
    };
  }

  private normalizeFilters(filters: Record<string, string>): Record<string, string> {
    const normalized: Record<string, string> = {};

    for (const [key, rawValue] of Object.entries(filters)) {
      const value = rawValue.trim();
      if (!value) continue;

      if (key === 'pesoKg') {
        const pesoKg = this.normalizePesoFilter(value);
        if (pesoKg) normalized[key] = pesoKg;
        continue;
      }

      normalized[key] = value;
    }

    return normalized;
  }

  private normalizeTextFilter(value: string | undefined): string | undefined {
    const normalized = value?.trim();
    return normalized || undefined;
  }

  private normalizePesoFilter(value: string | undefined): string | undefined {
    const normalized = value?.trim().replace(',', '.');
    if (!normalized || !/^\d+(\.\d*)?$/.test(normalized)) return undefined;
    return normalized;
  }

  private parseEsPeDateToIso(value: string | undefined): string | undefined {
    value = this.normalizeTextFilter(value);
    if (!value) return undefined;

    const partes = value.split('/');
    if (partes.length !== 3) return undefined;

    const [dia, mes, anio] = partes;
    if (!dia || !mes || !anio) return undefined;
    if (!/^\d{1,2}$/.test(dia) || !/^\d{1,2}$/.test(mes) || !/^\d{4}$/.test(anio)) return undefined;

    const diaPad = dia.padStart(2, '0');
    const mesPad = mes.padStart(2, '0');
    const diaNum = Number(diaPad);
    const mesNum = Number(mesPad);
    if (diaNum < 1 || diaNum > 31 || mesNum < 1 || mesNum > 12) return undefined;

    return `${anio}-${mesPad}-${diaPad}`;
  }

  cargarCatalogos(): void {
    this.repository.getTiposPeso().subscribe((data) => this.tiposPeso.set(data));
    this.repository.getVacunos().subscribe((data) => this.vacunos.set(data));
  }

  cargarPagina(page: number = this._paginaActual()): void {
    const requestId = ++this.loadRequestId;
    this._loading.set(true);
    this._error.set(null);

    this.repository
      .getAll(this.buildFiltros(page)).subscribe({
        next: (response) => {
          if (requestId !== this.loadRequestId) return;
          this._triajes.set(response.items);
          this._totalItems.set(response.totalItems);
          this._totalPaginas.set(response.totalPaginas);
          this._paginaActual.set(response.paginaActual);
          this._limitePorPagina.set(response.limitePorPagina);
          this._loading.set(false);
        },
        error: () => {
          if (requestId !== this.loadRequestId) return;
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
    const normalized = this.normalizeFilters(filters);
    this._filtros.set(normalized);
    this._paginaActual.set(1);
    this.filterChanges.next(normalized);
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
