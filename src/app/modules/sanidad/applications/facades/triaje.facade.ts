import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { TriajeRepository } from '@modules/sanidad/domain/interfaces/triaje-repository.interface';
import {
  TriajeRegistro,
  RegistrarTriajePayload,
  ActualizarTriajePayload,
  EliminarTriajePayload,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
  TriajeHistorialItem,
} from '@modules/sanidad/domain/models/triaje.model';

@Injectable({ providedIn: 'root' })
export class TriajeFacade {
  private readonly repository = inject(TriajeRepository);

  private _triajes = signal<TriajeRegistro[]>([]);
  private _totalPaginas = signal(0);
  private _totalItems = signal(0);
  private _paginaActual = signal(1);
  private _limitePorPagina = signal(10);
  private _cargando = signal(false);
  private _error = signal<string | null>(null);

  private _filtros = signal<Record<string, string>>({});
  private _filtroBusqueda = signal('');

  readonly triajes = this._triajes.asReadonly();
  readonly totalPaginas = this._totalPaginas.asReadonly();
  readonly totalItems = this._totalItems.asReadonly();
  readonly paginaActual = this._paginaActual.asReadonly();
  readonly limitePorPagina = this._limitePorPagina.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filtros = this._filtros.asReadonly();

  readonly tiposPeso = signal<TriajeTipoPesoOption[]>([]);
  readonly vacunos = signal<TriajeVacunoOption[]>([]);

  cargarCatalogos(): void {
    this.repository.getTiposPeso().subscribe((data) => this.tiposPeso.set(data));
    this.repository.getVacunos().subscribe((data) => this.vacunos.set(data));
  }

  cargarPagina(page: number): void {
    this._cargando.set(true);
    this._error.set(null);

    const f = this._filtros();
    this.repository
      .getAll(page, this._limitePorPagina(), {
        fecha: f['fechaHora'] || undefined,
        codigo: f['codigo'] || undefined,
        nombre: f['vacunoNombre'] || undefined,
        tipoPeso: f['tipoPesoCode'] || undefined,
        pesoKg: f['pesoKg'] ? Number(f['pesoKg']) : undefined,
        vacunoId: f['vacunoId'] ? Number(f['vacunoId']) : undefined,
      })
      .subscribe({
        next: (response) => {
          this._triajes.set(response.items);
          this._totalItems.set(response.totalItems);
          this._totalPaginas.set(response.totalPaginas);
          this._paginaActual.set(response.paginaActual);
          this._limitePorPagina.set(response.limitePorPagina);
          this._cargando.set(false);
        },
        error: () => {
          this._error.set('Error al cargar los triajes');
          this._cargando.set(false);
        },
      });
  }

  cambiarLimite(limit: number): void {
    this._limitePorPagina.set(limit);
    this.cargarPagina(1);
  }

  cargarPorVacuno(vacunoId: number): void {
    this._filtros.set({ vacunoId: String(vacunoId) });
    this.cargarPagina(1);
  }

  actualizarFiltros(filters: Record<string, string>): void {
    this._filtros.set(filters);
    this.cargarPagina(1);
  }

  actualizarBusqueda(q: string): void {
    this._filtroBusqueda.set(q);
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
}
