import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { environment } from '@env/environment';
import {
  ActualizarTriajePayload,
  EliminarTriajePayload,
  PagedResponse,
  RegistrarTriajePayload,
  TriajeDTO,
  TriajeRegistro,
  TriajeHistorialItem,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
  ConsultaFiltros,
} from '@modules/sanidad/domain/models/triaje.model';
import { TriajeRepository} from '@modules/sanidad/domain/interfaces/triaje-repository.interface';
import { TriajeMapper } from '@modules/sanidad/applications/mappers/triaje.mapper';
import { PaginatedResult } from '@shared/models/pagination.model';

type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };
type TriajeListPayload = PagedResponse<TriajeDTO> | PaginatedResult<TriajeDTO> | TriajeDTO[];

@Injectable({ providedIn: 'root' })
export class TriajeService implements TriajeRepository {
  private readonly http = inject(HttpClient);
  private readonly apiPath = 'api/v1/triaje';
  private readonly apiUrl = `${environment.apiUrl}/${this.apiPath}`;

  private readonly cache = new Map<string, { data: unknown; ts: number }>();
  private readonly TTL = 60_000;

  private fromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.ts < this.TTL) return entry.data as T;
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: unknown): void {
    if (this.cache.size > 20) this.cache.clear();
    this.cache.set(key, { data, ts: Date.now() });
  }

  private cacheKey(prefix: string, filtros?: ConsultaFiltros): string {
    return `${prefix}${JSON.stringify(filtros ?? {})}`;
  }

  private buildParams(filtros?: ConsultaFiltros): HttpParams {
    let params = new HttpParams();
    if (filtros?.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros?.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros?.vacunoId) params = params.set('vacunoId', filtros.vacunoId);
    if (filtros?.page !== undefined) params = params.set('pagina', filtros.page);
    if (filtros?.pageSize !== undefined) params = params.set('tamano', filtros.pageSize);
    if (filtros?.codigo) params = params.set('codigo', filtros.codigo);
    if (filtros?.vacunoNombre) params = params.set('vacunoNombre', filtros.vacunoNombre);
    if (filtros?.tipoPeso) params = params.set('tipoPeso', filtros.tipoPeso);
    if (filtros?.pesoKg !== undefined) params = params.set('pesoKg', filtros.pesoKg.toString());
    return params;
  }

  private toPaginatedResult(
    payload: TriajeListPayload,
    filtros?: ConsultaFiltros,
  ): PaginatedResult<TriajeRegistro> {
    if (Array.isArray(payload)) {
      const items = TriajeMapper.toDomainList(payload);
      return {
        items,
        totalItems: items.length,
        paginaActual: filtros?.page ?? 1,
        totalPaginas: 1,
        limitePorPagina: filtros?.pageSize ?? items.length,
      };
    }

    if ('items' in payload) {
      return {
        items: TriajeMapper.toDomainList(payload.items),
        totalItems: payload.totalItems,
        paginaActual: payload.paginaActual,
        totalPaginas: payload.totalPaginas,
        limitePorPagina: payload.limitePorPagina,
      };
    }

    return {
      items: TriajeMapper.toDomainList(payload.data),
      totalItems: payload.totalRegistros,
      paginaActual: payload.pagina,
      totalPaginas: payload.totalPaginas,
      limitePorPagina: payload.tamano,
    };
  }

  invalidateCache(): void {
    this.cache.clear();
  }

  create(payload: RegistrarTriajePayload): Observable<TriajeRegistro> {
    this.invalidateCache();
    return this.http
      .post<ApiResponse<TriajeDTO>>(this.apiUrl, payload)
      .pipe(map((r) => TriajeMapper.toDomain(r.data)));
  }

  getAll(filtros?: ConsultaFiltros): Observable<PaginatedResult<TriajeRegistro>> {
    const key = JSON.stringify(filtros ?? {});
    const cached = this.fromCache<PaginatedResult<TriajeRegistro>>(key);
    if (cached) return of(cached);

    return this.http
      .get<ApiResponse<TriajeListPayload>>(this.apiUrl, { params: this.buildParams(filtros) })
      .pipe(
        map((r) => this.toPaginatedResult(r.data, filtros)),
        map((result) => {
          this.setCache(key, result);
          return result;
        }),
      );
  }
  getById(id: number): Observable<TriajeRegistro> {
    this.invalidateCache();
    return this.http
      .get<ApiResponse<TriajeDTO>>(`${this.apiUrl}/${id}`)
      .pipe(map((r) => TriajeMapper.toDomain(r.data)));
  }

  update(id: number, payload: ActualizarTriajePayload): Observable<void> {
    return this.http
      .patch<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number, payload: EliminarTriajePayload): Observable<void> {
    this.invalidateCache();
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { body: payload });
  }

  getTiposPeso(): Observable<TriajeTipoPesoOption[]> {
    return this.http
      .get<ApiResponse<TriajeTipoPesoOption[]>>(`${this.apiUrl}/tipos-peso`)
      .pipe(map((r) => r.data));
  }

  getVacunos(): Observable<TriajeVacunoOption[]> {
    return this.http
      .get<ApiResponse<TriajeVacunoOption[]>>(`${this.apiUrl}/vacunos`)
      .pipe(map((r) => r.data));
  }

  getHistorialByVacunoId(vacunoId: number): Observable<TriajeHistorialItem[]> {
    return this.http
      .get<ApiResponse<TriajeHistorialItem[]>>(`${this.apiUrl}/historial/${vacunoId}`)
      .pipe(map((r) => r.data));
  }
}
