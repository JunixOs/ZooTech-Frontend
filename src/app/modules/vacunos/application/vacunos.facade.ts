import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RegistrarVacunoRequest,
  RegistrarVacunoResponse,
  Vacuno,
} from '../domain/models/vacuno.model';
import { PaginatedResult } from '@shared/models/pagination.model';
import { VacunosApiService } from '../infrastructure/vacunos.api.service';
import {
  GranjaOption,
  VacunoActivityStatsDto,
  VacunoGenealogiaDto,
  VacunoOptionsResponse,
  VacunosQueryParams,
} from '../infrastructure/dtos/vacunos.dtos';

@Injectable({ providedIn: 'root' })
export class VacunosFacade {
  private repository = inject(VacunosApiService);

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
      limit: this._limitePorPagina(),
      ...(this._filtroBusqueda() ? { q: this._filtroBusqueda() } : {}),
      ...(this._fechaDesde() ? { fechaDesde: this._fechaDesde()! } : {}),
      ...(this._fechaHasta() ? { fechaHasta: this._fechaHasta()! } : {}),
      ...(this._estado() ? { estado: this._estado()! } : {}),
      ...extraParams,
    };

    this.repository.listarVacunos(query).subscribe({
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
    return this.repository.obtenerVacuno(codigo);
  }

  eliminarVacuno(id: string | number, motivoEliminacion: string): Observable<void> {
    return this.repository.eliminarVacuno(id, motivoEliminacion);
  }

  registrarVacuno(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse> {
    return this.repository.registrarVacuno(data);
  }

  actualizarVacuno(id: string | number, data: RegistrarVacunoRequest): Observable<Vacuno> {
    return this.repository.actualizarVacuno(id, data);
  }

  obtenerOpciones(): Observable<VacunoOptionsResponse> {
    return this.repository.obtenerOpciones();
  }

  listarGranjas(): Observable<GranjaOption[]> {
    return this.repository.listarGranjas();
  }

  listarVacunos(params: VacunosQueryParams = {}): Observable<PaginatedResult<Vacuno>> {
    return this.repository.listarVacunos(params);
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

  private extraerMensajeError(err: HttpErrorResponse): string {
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
