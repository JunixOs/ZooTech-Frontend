import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable, of } from 'rxjs';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import {
  ConsultaFiltros,
  LecheRegistro,
  LecheVacunoOption,
  OrdenioDTO,
  RegistrarLecheRequest,
  UpdateLecheRequest,
  VacasSequiaResponse,
} from '@modules/leche/domain/models/leche.model';
import { LecheMapper } from '@modules/leche/applications/mappers/leche.mapper';
import { VacasSequiaCalculator } from '@modules/leche/applications/services/vacas-sequia-calculator';
import { environment } from '@env/environment';
import { PaginatedResult } from '@shared/models/pagination.model';

type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };
type ApiPagedPayload<T> =
  | T[]
  | {
      items?: T[];
      data?: T[];
      totalRegistros?: number;
      totalItems?: number;
      pagina?: number;
      paginaActual?: number;
      tamano?: number;
      limitePorPagina?: number;
      totalPaginas?: number;
    }
  | null
  | undefined;

@Injectable({ providedIn: 'root' })
export class LecheService implements LecheRepository {
  private http = inject(HttpClient);
  private readonly apiPath = 'api/v1/produccion-leche';
  private readonly apiUrl = `${environment.apiUrl}/${this.apiPath}`;

  private extractList<T>(payload: ApiPagedPayload<T>): T[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }

  private extractPaginatedResult<T>(payload: ApiPagedPayload<T>): PaginatedResult<T> {
    const items = this.extractList(payload);

    if (Array.isArray(payload)) {
      return {
        items,
        totalItems: items.length,
        paginaActual: 1,
        totalPaginas: items.length > 0 ? 1 : 0,
        limitePorPagina: items.length,
      };
    }

    const totalItems = payload?.totalRegistros ?? payload?.totalItems ?? items.length;
    const paginaActual = payload?.pagina ?? payload?.paginaActual ?? 1;
    const limitePorPagina = payload?.tamano ?? payload?.limitePorPagina ?? items.length;
    const totalPaginas =
      payload?.totalPaginas ??
      (limitePorPagina > 0 ? Math.ceil(totalItems / limitePorPagina) : totalItems > 0 ? 1 : 0);

    return {
      items,
      totalItems,
      paginaActual,
      totalPaginas,
      limitePorPagina,
    };
  }

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
    if (filtros?.page !== undefined) params = params.set('page', filtros.page);
    if (filtros?.pageSize !== undefined) params = params.set('pageSize', filtros.pageSize);
    return params;
  }

  invalidateCache(): void {
    this.cache.clear();
  }

  getAll(filtros?: ConsultaFiltros): Observable<PaginatedResult<LecheRegistro>> {
    const key = JSON.stringify(filtros ?? {});
    const cached = this.fromCache<PaginatedResult<LecheRegistro>>(key);
    if (cached) return of(cached);

    return this.http
      .get<ApiResponse<ApiPagedPayload<OrdenioDTO>>>(this.apiUrl, { params: this.buildParams(filtros) })
      .pipe(
        map((r) => this.extractPaginatedResult(r.data)),
        map((result) => {
          const paginated = {
            ...result,
            items: LecheMapper.toDomainList(result.items),
          };
          this.setCache(key, paginated);
          return paginated;
        }),
      );
  }

  getById(id: string): Observable<LecheRegistro> {
    return this.http
      .get<ApiResponse<OrdenioDTO>>(`${this.apiUrl}/${id}`)
      .pipe(map((r) => LecheMapper.toDomain(r.data)));
  }

  create(data: RegistrarLecheRequest): Observable<void> {
    this.invalidateCache();
    return this.http.post<void>(this.apiUrl, data);
  }

  deleteById(id: string, motivo: string): Observable<void> {
    this.invalidateCache();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      body: { motivoEliminacion: motivo },
    });
  }

  updateById(id: string, data: UpdateLecheRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}`, data);
  }

  getVacunos(): Observable<LecheVacunoOption[]> {
    return this.http
      .get<ApiResponse<LecheVacunoOption[]>>(`${this.apiUrl}/vacunos`)
      .pipe(map((r) => r.data));
  }

  getVacasEnSequia(filtros?: ConsultaFiltros): Observable<VacasSequiaResponse> {
    const key = this.cacheKey('sequia-v2-', filtros);
    const cached = this.fromCache<VacasSequiaResponse>(key);
    if (cached) return of(cached);

    return forkJoin({
      registros: this.getAll(filtros),
      vacunos: this.getVacunos(),
    }).pipe(
      map(({ registros, vacunos }) => {
        const response = VacasSequiaCalculator.calculate(registros.items, vacunos, filtros);
        this.setCache(key, response);
        return response;
      }),
    );
  }

  downloadExcel(filtros?: ConsultaFiltros): Observable<Blob> {
    const params = this.buildFiltrosParams(filtros);
    return this.http.get(`${this.apiUrl}/reporte/excel`, {
      params,
      responseType: 'blob',
    });
  }

  downloadPdf(filtros?: ConsultaFiltros): Observable<Blob> {
    const params = this.buildFiltrosParams(filtros);
    return this.http.get(`${this.apiUrl}/reporte/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  private buildFiltrosParams(filtros?: ConsultaFiltros): HttpParams {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
      if (filtros.vacunoId) params = params.set('vacunoId', filtros.vacunoId);
      if (filtros.page !== undefined) params = params.set('page', filtros.page.toString());
      if (filtros.pageSize !== undefined)
        params = params.set('pageSize', filtros.pageSize.toString());
      if (filtros.comparativo !== undefined && filtros.comparativo !== null) {
        params = params.set('comparativo', String(filtros.comparativo));
      }
    }
    return params;
  }
}
