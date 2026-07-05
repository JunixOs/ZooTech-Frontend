import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FecundacionApiService, FecundacionesQueryParams } from '../infrastructure/fecundacion.api.service';
import {
  CreateFecundacionRequest,
  CreateFecundacionResponse,
  FecundacionEdit,
  FecundacionOptions,
  FecundacionRegistro,
  FecundacionUpdateResponse,
  FecundacionVacunoOption,
  UpdateFecundacionRequest,
} from '../domain/models/fecundacion.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FecundacionFacade {
  private repository = inject(FecundacionApiService);

  // Estado privado
  private _fecundaciones = signal<FecundacionRegistro[]>([]);
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
  private _resultado = signal<string | null>(null);

  // Estado público
  readonly fecundaciones = this._fecundaciones.asReadonly();
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

  actualizarFechasRango(desde: Date | null, hasta: Date | null) {
    this._fechaDesde.set(desde ? desde.toISOString().split('T')[0] : null);
    this._fechaHasta.set(hasta ? hasta.toISOString().split('T')[0] : null);
    this.cargarPagina(1);
  }

  actualizarResultado(resultado: string | null) {
    this._resultado.set(resultado);
    this.cargarPagina(1);
  }

  cambiarLimite(limit: number) {
    this._limitePorPagina.set(limit);
    this.cargarPagina(1);
  }

  crear(payload: CreateFecundacionRequest): Observable<CreateFecundacionResponse> {
    return this.repository.crear(payload);
  }

  obtenerParaEditar(id: number): Observable<FecundacionEdit> {
    return this.repository.obtenerParaEditar(id);
  }

  obtenerOpciones(): Observable<FecundacionOptions> {
    return this.repository.obtenerOpciones();
  }

  buscarVacunos(
    sexo: 'hembra' | 'macho',
    q = '',
    soloDisponibles = false,
    excluirFecundacionId: number | null = null,
  ): Observable<FecundacionVacunoOption[]> {
    return this.repository.buscarVacunos(sexo, q, soloDisponibles, excluirFecundacionId);
  }

  actualizar(id: number, payload: UpdateFecundacionRequest): Observable<FecundacionUpdateResponse> {
    return this.repository.actualizar(id, payload);
  }

  eliminar(id: number, razon: string): Observable<void> {
    return this.repository.eliminar(id, razon);
  }

  cargarPagina(page: number): void {
    this._cargando.set(true);
    this._error.set(null);

    const query: FecundacionesQueryParams = {
      page,
      limit: this._limitePorPagina(),
      ...(this._filtroBusqueda() ? { query: this._filtroBusqueda() } : {}),
      ...(this._fechaDesde() ? { fechaDesde: this._fechaDesde()! } : {}),
      ...(this._fechaHasta() ? { fechaHasta: this._fechaHasta()! } : {}),
      ...(this._resultado() ? { resultado: this._resultado()! } : {}),
    };

    this.repository.listarFecundaciones(query).subscribe({
      next: (result) => {
        this._fecundaciones.set(result.data);
        const totalPages = Math.ceil(result.totalCount / result.limit);
        this._totalPaginas.set(totalPages || 1);
        this._totalItems.set(result.totalCount);
        this._paginaActual.set(result.page);
        this._cargando.set(false);
      },
      error: (err) => {
        this._error.set(this.extraerMensajeError(err));
        this._cargando.set(false);
      },
    });
  }

  private extraerMensajeError(err: HttpErrorResponse): string {
    if (err.error?.errorMessage) return err.error.errorMessage;
    if (err.error?.error?.message) return err.error.error.message;

    switch (err.status) {
      case 0:
        return 'shared.errors.backend';
      case 400:
        return 'shared.errors.badRequest';
      case 401:
        return 'shared.errors.unauthorized';
      case 403:
        return 'shared.errors.forbidden';
      case 404:
        return 'shared.errors.notFound';
      case 500:
        return 'shared.errors.serverError';
      default:
        return 'shared.errors.unexpected';
    }
  }
}
