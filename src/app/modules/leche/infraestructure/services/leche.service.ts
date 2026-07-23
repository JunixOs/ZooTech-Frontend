import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import {
  ConsultaFiltros,
  LecheRegistro,
  LecheVacunoOption,
  OrdenioDTO,
  RegistrarLecheRequest,
  UpdateLecheRequest,
} from '@modules/leche/domain/models/leche.model';
import { LecheMapper } from '@modules/leche/applications/mappers/leche.mapper';
import { environment } from '@env/environment';
import { PaginatedResult } from '@shared/models/pagination.model';

type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };
type ApiPagedPayload<T> =
  | T[]
  | {
      items?: T[];
      data?: T[] | ApiPagedPayload<T>;
      totalRegistros?: number;
      totalItems?: number;
      totalCount?: number;
      total?: number;
      pagina?: number;
      paginaActual?: number;
      page?: number;
      tamano?: number;
      limitePorPagina?: number;
      pageSize?: number;
      limit?: number;
      totalPaginas?: number;
      totalPages?: number;
      pagination?: {
        page?: number;
        pageSize?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
      };
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
    if (payload?.data && typeof payload.data === 'object') return this.extractList(payload.data);
    return [];
  }

  private firstNumber(...values: Array<number | null | undefined>): number | undefined {
    return values.find((value): value is number => typeof value === 'number' && Number.isFinite(value));
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

    const nested =
      payload?.data && !Array.isArray(payload.data) && typeof payload.data === 'object'
        ? payload.data
        : undefined;

    const totalItems =
      this.firstNumber(
        payload?.pagination?.total,
        payload?.totalRegistros,
        payload?.totalItems,
        payload?.totalCount,
        payload?.total,
        nested?.pagination?.total,
        nested?.totalRegistros,
        nested?.totalItems,
        nested?.totalCount,
        nested?.total,
      ) ?? items.length;
    const paginaActual =
      this.firstNumber(
        payload?.pagination?.page,
        payload?.page,
        payload?.pagina,
        payload?.paginaActual,
        nested?.pagination?.page,
        nested?.page,
        nested?.pagina,
        nested?.paginaActual,
      ) ?? 1;
    const limitePorPagina =
      this.firstNumber(
        payload?.pagination?.pageSize,
        payload?.pagination?.limit,
        payload?.pageSize,
        payload?.limit,
        payload?.tamano,
        payload?.limitePorPagina,
        nested?.pagination?.pageSize,
        nested?.pagination?.limit,
        nested?.pageSize,
        nested?.limit,
        nested?.tamano,
        nested?.limitePorPagina,
      ) ?? items.length;
    const totalPaginas =
      this.firstNumber(
        payload?.pagination?.totalPages,
        payload?.totalPages,
        payload?.totalPaginas,
        nested?.pagination?.totalPages,
        nested?.totalPages,
        nested?.totalPaginas,
      ) ??
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
    const key = `ordenios:${JSON.stringify(filtros ?? {})}`;
    const cached = this.fromCache<PaginatedResult<LecheRegistro>>(key);
    if (cached) return of(cached);

    return this.fetchPage(filtros).pipe(
      map((result) => {
        this.setCache(key, result);
        return result;
      }),
    );
  }

  private fetchPage(filtros?: ConsultaFiltros): Observable<PaginatedResult<LecheRegistro>> {
    return this.http
      .get<ApiResponse<ApiPagedPayload<OrdenioDTO>> | ApiPagedPayload<OrdenioDTO>>(this.apiUrl, {
        params: this.buildParams(filtros),
      })
      .pipe(
        map((r) => this.extractPaginatedResult(r)),
        map((result) => {
          return {
            ...result,
            items: LecheMapper.toDomainList(result.items),
          };
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
    return this.http.post<void>(this.apiUrl, {
      codigo: data.codigo,
      fechaHora: this.normalizeDateTime(data.fechaHora),
      vacunoId: data.vacunoId,
      encargadoUsuarioId: data.encargadoUsuarioId,
      litros: data.litros,
      observaciones: data.observaciones ?? '',
      estadoOrdenioCode: data.estadoOrdenioCode,
    });
  }

  private normalizeDateTime(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }

  deleteById(id: string, motivo: string): Observable<void> {
    this.invalidateCache();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      body: { motivoEliminacion: motivo },
    });
  }

  updateById(id: string, data: UpdateLecheRequest): Observable<void> {
    this.invalidateCache();
    return this.http.patch<void>(`${this.apiUrl}/${id}`, data);
  }

  getVacunos(): Observable<LecheVacunoOption[]> {
    const key = 'vacunos';
    const cached = this.fromCache<LecheVacunoOption[]>(key);
    if (cached) return of(cached);

    return this.http
      .get<ApiResponse<LecheVacunoOption[]>>(`${this.apiUrl}/vacunos`)
      .pipe(
        map((r) => {
          this.setCache(key, r.data);
          return r.data;
        }),
      );
  }

  downloadExcel(filtros?: ConsultaFiltros): Observable<Blob> {
    const params = this.buildFiltrosParams({ comparativo: false, ...filtros });
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
      if (filtros.estadoOrdenioCode) params = params.set('estadoOrdenioCode', filtros.estadoOrdenioCode);
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
