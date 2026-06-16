import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrarVacunoRequest, RegistrarVacunoResponse, Vacuno } from '../domain/models/vacuno.model';
import { PaginatedResult } from '@shared/models/pagination.model';
import { VacunoService, VacunoActivityStatsDto, VacunoGenealogiaDto, VacunoOptionsResponse, VacunosQueryParams} from '../infrastructure/vacunos.api.service';

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
  private _filtroEstado = signal<'activo' | 'eliminado' | null>(null);
  private _filtroBusqueda = signal('');
  private _fechaDesde = signal<string | null>(null);
  private _fechaHasta = signal<string | null>(null);

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

  actualizarEstado(estado: string | null) {
    const estadoValido = estado === 'activo' || estado === 'eliminado' ? estado : null;
    this._filtroEstado.set(estadoValido);
    this.cargarPagina(1);
  }

  actualizarFechas(desde: Date | null, hasta: Date | null) {
    this._fechaDesde.set(desde ? desde.toISOString().split('T')[0] : null);
    this._fechaHasta.set(hasta ? hasta.toISOString().split('T')[0] : null);
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
      ...(this._filtroEstado() ? { estado: this._filtroEstado()! } : {}),
      ...(this._filtroBusqueda() ? { q: this._filtroBusqueda() } : {}),
      ...(this._fechaDesde() ? { fechaDesde: this._fechaDesde()! } : {}),
      ...(this._fechaHasta() ? { fechaHasta: this._fechaHasta()! } : {}),
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

  registrarVacuno(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse> {
    return this.repository.create(data);
  }

  actualizarVacuno(id: string, data: RegistrarVacunoRequest): Observable<Vacuno> {
    return this.repository.updateById(id, data);
  }

  obtenerOpciones(): Observable<VacunoOptionsResponse> {
    return this.repository.obtenerOpciones();
  }
  
  listarVacunos(params: VacunosQueryParams = {}): Observable<PaginatedResult<Vacuno>> {
    return this.repository.getAll(params);
  }

  getActivityStats(fechaInicio: string, fechaFin: string): Observable<VacunoActivityStatsDto> {
    return this.repository.getActivityStats(fechaInicio, fechaFin);
  }

  getGenealogia(codigoOId: string, niveles: number): Observable<VacunoGenealogiaDto> {
    return this.repository.getGenealogia(codigoOId, niveles);
  }

  private extraerMensajeError(err: HttpErrorResponse): string {
    if (err.error?.error?.message) return err.error.error.message;

    switch (err.status) {
      case 0: return 'No se pudo conectar con el backend. Verifica que la API esté ejecutándose en http://localhost:16000.';
      case 400: return 'Los datos enviados no son válidos.';
      case 401: return 'No autorizado. Inicia sesión nuevamente.';
      case 403: return 'No tienes permisos o el módulo no está habilitado.';
      case 404: return 'El recurso solicitado no existe.';
      case 500: return 'Error interno del servidor. Intenta más tarde.';
      default:  return 'Ocurrió un error inesperado.';
    }
  }
}
