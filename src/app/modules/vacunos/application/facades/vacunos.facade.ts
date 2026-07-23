import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import {
  RegistrarVacunoRequest,
  RegistrarVacunoResponse,
  Vacuno,
  GranjaOption,
  VacunoActivityStatsDto,
  VacunoGenealogiaDto,
  VacunoOptionsResponse,
  VacunoReferenceOption,
  VacunosQueryParams,
} from '../../domain/models/vacuno.model';
import { PaginatedResult } from '@shared/models/pagination.model';
import { ServerTablePage } from '@shared/utils/server-table-state';
import { VacunoService } from '../../infrastructure/services/vacunos.service';

@Injectable({ providedIn: 'root' })
export class VacunosFacade {
  private repository = inject(VacunoService);

  // Estado privado
  private _vacunos = signal<Vacuno[]>([]);
  private _totalPaginas = signal(0);
  private _totalItems = signal(0);
  private _paginaActual = signal(1);
  private _limitePorPagina = signal(10);
  private _cargando = signal(false);
  private _error = signal<string | null>(null);

  // Filtros
  private _filtroBusqueda = signal('');
  private _fechaDesde = signal<string | null>(null);
  private _fechaHasta = signal<string | null>(null);
  private _estado = signal<string | null>(null);

  // Estado público
  readonly vacunos = this._vacunos.asReadonly();
  readonly totalPaginas = this._totalPaginas.asReadonly();
  readonly totalItems = this._totalItems.asReadonly();
  readonly paginaActual = this._paginaActual.asReadonly();
  readonly limitePorPagina = this._limitePorPagina.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  actualizarBusqueda(q: string) {
    this._filtroBusqueda.set(q);
    this.cargarPagina(1);
  }

  actualizarFechas(desde: Date | null, hasta: Date | null) {
    this._fechaDesde.set(desde ? desde.toISOString().split('T')[0] : null);
    this._fechaHasta.set(hasta ? hasta.toISOString().split('T')[0] : null);
    this.cargarPagina(1);
  }

  actualizarEstado(estado: string | null) {
    this._estado.set(estado);
    this.cargarPagina(1);
  }

  cambiarLimite(limit: number) {
    this._limitePorPagina.set(limit);
    this.cargarPagina(1);
  }

  cargarPagina(page: number, extraParams: Partial<VacunosQueryParams> = {}): void {
    this._cargando.set(true);
    this._error.set(null);

    const query: VacunosQueryParams = {
      page,
      pageSize: this._limitePorPagina(),
      ...(this._filtroBusqueda() ? { search: this._filtroBusqueda() } : {}),
      ...(this._fechaDesde() ? { fechaDesde: this._fechaDesde()! } : {}),
      ...(this._fechaHasta() ? { fechaHasta: this._fechaHasta()! } : {}),
      ...(this._estado() ? { estado: this._estado()! } : {}),
      ...extraParams,
    };

    this.repository.getAll(query).subscribe({
      next: (result) => {
        this._vacunos.set(result.items);
        this._totalPaginas.set(result.totalPaginas);
        this._totalItems.set(result.totalItems);
        this._paginaActual.set(result.paginaActual);
        this._cargando.set(false);
      },
      error: (err) => {
        this._error.set(this.extraerMensajeError(err));
        this._cargando.set(false);
      },
    });
  }

  obtenerVacuno(codigo: string): Observable<Vacuno> {
    return this.repository.getById(codigo);
  }

  eliminarVacuno(id: string | number, motivoEliminacion: string): Observable<void> {
    return this.repository.deleteById(id, motivoEliminacion);
  }

  registrarVacuno(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse> {
    return this.repository.create(data);
  }

  actualizarVacuno(id: string | number, data: RegistrarVacunoRequest): Observable<Vacuno> {
    return this.repository.updateById(id, data);
  }

  obtenerOpciones(): Observable<VacunoOptionsResponse> {
    return this.repository.getOptions();
  }

  listarGranjas(): Observable<GranjaOption[]> {
    return this.repository.getGranjas();
  }

  listarReferencias(): Observable<VacunoReferenceOption[]> {
    return this.repository.getReferences();
  }
  
  listarVacunos(params: VacunosQueryParams = {}): Observable<PaginatedResult<Vacuno>> {
    return this.repository.getAll(params);
  }

  cargarListado(params: {
    search: string;
    page: number;
    pageSize: number;
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
  }): Observable<ServerTablePage<Vacuno>> {
    this._cargando.set(true);
    this._error.set(null);

    return this.repository.getAll({
      search: params.search || undefined,
      page: params.page,
      pageSize: params.pageSize,
      fechaDesde: params.fechaInicio,
      fechaHasta: params.fechaFin,
      estado: params.estado || undefined,
    }).pipe(
      tap({
        next: (result) => {
          this._vacunos.set(result.items);
          this._totalPaginas.set(result.totalPaginas);
          this._totalItems.set(result.totalItems);
          this._paginaActual.set(result.paginaActual);
          this._limitePorPagina.set(result.limitePorPagina);
          this._cargando.set(false);
        },
        error: (err) => {
          this._error.set(this.extraerMensajeError(err));
          this._cargando.set(false);
        },
      }),
      map((result) => ({ data: result.items, totalCount: result.totalItems })),
    );
  }

  getActivityStats(fechaInicio: string, fechaFin: string): Observable<VacunoActivityStatsDto> {
    return this.repository.getActivityStats(fechaInicio, fechaFin);
  }

  getGenealogia(codigoOId: string | number, niveles: number): Observable<VacunoGenealogiaDto> {
    return this.repository.getGenealogia(codigoOId, niveles);
  }

  exportarArbolExcel(id: number, niveles: number = 4): Observable<Blob> {
    return this.repository.exportarArbolExcel(id, niveles);
  }



  private extraerMensajeError(err: unknown): string {
    if (err instanceof Error && !(err instanceof HttpErrorResponse)) {
      return err.message;
    }

    if (!(err instanceof HttpErrorResponse)) {
      return 'vacunos.errors.unexpected';
    }

    if (err.error?.error?.message) return err.error.error.message;

    switch (err.status) {
      case 0:
        return 'vacunos.errors.backend';
      case 400:
        return 'vacunos.errors.badRequest';
      case 401:
        return 'vacunos.errors.unauthorized';
      case 403:
        return 'vacunos.errors.forbidden';
      case 404:
        return 'vacunos.errors.notFound';
      case 500:
        return 'vacunos.errors.serverError';
      default:
        return 'vacunos.errors.unexpected';
    }
  }
}
