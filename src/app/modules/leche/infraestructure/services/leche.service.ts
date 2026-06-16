import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import {
  LecheRepository,
  ConsultaFiltros,
} from '@modules/leche/domain/interfaces/leche-repository.interface';
import {
  LecheRegistro,
  LecheVacunoOption,
  OrdenioDTO,
  RegistrarLecheRequest,
} from '@modules/leche/domain/models/leche.model';
import { LecheMapper } from '@modules/leche/applications/mappers/leche.mapper';
import { environment } from '@env/environment';
import {
  VacasSequiaResponse,
  VacunoSequia,
} from '@modules/leche/domain/models/leche.model';

type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };

interface Pagination { page: number; limit: number; total: number; totalPages: number; }
interface ListOrdeniosData { data: OrdenioDTO[]; pagination: Pagination; }

@Injectable({ providedIn: 'root' })
export class LecheService implements LecheRepository {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/produccion-leche`;

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

  invalidateCache(): void {
    this.cache.clear();
  }

  getAll(filtros?: ConsultaFiltros): Observable<LecheRegistro[]> {
    const key = JSON.stringify(filtros ?? {});
    const cached = this.fromCache<LecheRegistro[]>(key);
    if (cached) return of(cached);

    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
      if (filtros.vacunoId) params = params.set('vacunoId', filtros.vacunoId);
      if (filtros.page !== undefined) params = params.set('page', filtros.page);
      if (filtros.pageSize !== undefined) params = params.set('pageSize', filtros.pageSize);
    }
    return this.http
      .get<ApiResponse<ListOrdeniosData>>(this.apiUrl, { params })
      .pipe(map((r) => {
        const data = LecheMapper.toDomainList(r.data.data);
        this.setCache(key, data);
        return data;
      }));
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

  updateById(id: string, data: Partial<LecheRegistro>): Observable<void> {
    this.invalidateCache();
    return this.http.patch<void>(`${this.apiUrl}/${id}`, data);
  }

  getVacunos(): Observable<LecheVacunoOption[]> {
    return this.http
      .get<ApiResponse<LecheVacunoOption[]>>(`${this.apiUrl}/vacunos`)
      .pipe(map((r) => r.data));
  }

  getVacasEnSequia(filtros?: ConsultaFiltros): Observable<VacasSequiaResponse> {
    const key = this.cacheKey('sequia-', filtros);
    const cached = this.fromCache<VacasSequiaResponse>(key);
    if (cached) return of(cached);

    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
      if (filtros.vacunoId) params = params.set('vacunoId', filtros.vacunoId);
      if (filtros.page !== undefined) params = params.set('page', filtros.page);
      if (filtros.pageSize !== undefined) params = params.set('pageSize', filtros.pageSize);
    }
    return this.http
      .get<ApiResponse<VacasSequiaResponse>>(`${this.apiUrl}/vacas-sequia`, { params })
      .pipe(
        tap((r) => console.log('[VacasSequia] Respuesta del backend:', r)),
        map((r) => {
          if (!r?.data) {
            console.error('[VacasSequia] La respuesta no tiene la estructura esperada. Se esperaba { data: { actuales, futuros, historicos }, success, errorMessage }', r);
            return { actuales: [], futuros: [], historicos: [] };
          }
          this.setCache(key, r.data);
          return r.data;
        }),
      );
  }
}
