import { Injectable, inject, signal } from '@angular/core';
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
  VacunoSequia,
} from '@modules/leche/domain/models/leche.model';
import { LecheMapper } from '@modules/leche/applications/mappers/leche.mapper';
import { environment } from '@env/environment';

type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };
type ApiListPayload<T> = T[] | { items?: T[]; data?: T[] } | null | undefined;

@Injectable({ providedIn: 'root' })
export class LecheService implements LecheRepository {
  private http = inject(HttpClient);
  private API_RUTA: string = 'api/v1/produccion-leche';
  private readonly apiUrl = `${environment.apiUrl}/${this.API_RUTA}`;
  private readonly SEQUIA_DIAS = 7;

  private extractList<T>(payload: ApiListPayload<T>): T[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
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

  private parseFiltroFecha(value?: string, endOfDay = false): Date | null {
    if (!value) return null;

    const slashParts = value.split('/').map(Number);
    const date =
      slashParts.length === 3
        ? new Date(slashParts[2], slashParts[1] - 1, slashParts[0])
        : new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    if (endOfDay) date.setHours(23, 59, 59, 999);
    else date.setHours(0, 0, 0, 0);

    return date;
  }

  private parseRegistroFecha(registro: LecheRegistro): Date | null {
    const raw = registro['fechaHora'];
    if (typeof raw !== 'string' || !raw) return null;

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return null;

    date.setHours(0, 0, 0, 0);
    return date;
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private diffInDays(start: Date, end: Date): number {
    return Math.round((start.getTime() - end.getTime()) / 86_400_000);
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  }

  private buildSequiaResponse(
    registros: LecheRegistro[],
    vacunos: LecheVacunoOption[],
    filtros?: ConsultaFiltros,
  ): VacasSequiaResponse {
    const vacunosById = new Map(vacunos.map((vacuno) => [String(vacuno.id), vacuno]));
    const grupos = new Map<
      string,
      { vacunoId: string; fechas: Date[]; codigoVacuno: string; nombreVacuno: string | null }
    >();

    for (const registro of registros) {
      const fecha = this.parseRegistroFecha(registro);
      if (!fecha) continue;

      const vacunoId = String(registro.vacunoId ?? registro.codigoVacuno);
      const vacuno = vacunosById.get(vacunoId);
      const actual = grupos.get(vacunoId);

      if (actual) {
        actual.fechas.push(fecha);
        continue;
      }

      grupos.set(vacunoId, {
        vacunoId,
        fechas: [fecha],
        codigoVacuno: vacuno?.codigo ?? vacunoId,
        nombreVacuno: vacuno?.nombre ?? registro.nombreVacuno ?? null,
      });
    }

    const referencia = this.parseFiltroFecha(filtros?.fechaHasta, true) ?? new Date();
    referencia.setHours(23, 59, 59, 999);

    const response: VacasSequiaResponse = { actuales: [], futuros: [], historicos: [] };

    for (const grupo of grupos.values()) {
      grupo.fechas.sort((a, b) => a.getTime() - b.getTime());

      for (let index = 0; index < grupo.fechas.length - 1; index += 1) {
        const fechaActual = grupo.fechas[index];
        const fechaSiguiente = grupo.fechas[index + 1];
        if (this.diffInDays(fechaSiguiente, fechaActual) <= this.SEQUIA_DIAS) continue;

        const desde = this.addDays(fechaActual, this.SEQUIA_DIAS);
        const hasta = this.addDays(fechaSiguiente, -1);
        if (desde > hasta) continue;

        response.historicos.push({
          vacunoId: grupo.vacunoId,
          codigoVacuno: grupo.codigoVacuno,
          nombreVacuno: grupo.nombreVacuno,
          desde: this.formatDate(desde),
          hasta: this.formatDate(hasta),
        });
      }

      const ultimaFecha = grupo.fechas[grupo.fechas.length - 1];
      const probableInicio = this.addDays(ultimaFecha, this.SEQUIA_DIAS);
      const itemBase: VacunoSequia = {
        vacunoId: grupo.vacunoId,
        codigoVacuno: grupo.codigoVacuno,
        nombreVacuno: grupo.nombreVacuno,
      };

      if (probableInicio <= referencia) {
        response.actuales.push({
          ...itemBase,
          desde: this.formatDate(probableInicio),
          probablementeHasta: '',
        });
      } else {
        response.futuros.push({
          ...itemBase,
          probablementeDesde: this.formatDate(probableInicio),
          probablementeHasta: '',
        });
      }
    }

    response.actuales.sort((a, b) => (a.desde ?? '').localeCompare(b.desde ?? ''));
    response.futuros.sort((a, b) => (a.probablementeDesde ?? '').localeCompare(b.probablementeDesde ?? ''));
    response.historicos.sort((a, b) => (a.desde ?? '').localeCompare(b.desde ?? ''));

    return response;
  }

  invalidateCache(): void {
    this.cache.clear();
  }

  getAll(filtros?: ConsultaFiltros): Observable<LecheRegistro[]> {
    const key = JSON.stringify(filtros ?? {});
    const cached = this.fromCache<LecheRegistro[]>(key);
    if (cached) return of(cached);

    return this.http
      .get<ApiResponse<ApiListPayload<OrdenioDTO>>>(this.apiUrl, { params: this.buildParams(filtros) })
      .pipe(
        map((r) => LecheMapper.toDomainList(this.extractList(r.data))),
        map((registros) => {
          this.setCache(key, registros);
          return registros;
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
    })
      .pipe(
        map(({ registros, vacunos }) => {
          const response = this.buildSequiaResponse(registros, vacunos, filtros);
          this.setCache(key, response);
          return response;
        }),
      );
  }
}
