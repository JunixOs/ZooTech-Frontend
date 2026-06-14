import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '@core/api/api.config';
import { PaginatedResult } from '@shared/models/pagination.model';
import { Vacuno } from '../domain/models/vacuno.model';
import { VacunoMapper } from './vacunos.mapper';
import { 
  VacunosQueryParams, 
  VacunoActivityStatsDto, 
  VacunoGenealogiaDto, 
  VacunoOptionsResponse,
  RegistrarVacunoRequest,
  RegistrarVacunoResponse
} from './dtos/vacunos.dtos';

// ─── Backend response shapes ─────────────────────────────────────────────────
type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };

interface BackendVacunoItem {
  id: number; codigo: string; nombre: string; fechaNacimiento: string;
  razaCode: string; sexoCode: string; procedencia: string | null; estado: string;
}

interface BackendVacunoDetail {
  id: number; codigo: string; nombre: string;
  fechaNacimiento: string; tipoAdquisicionCode: string;
  razaCode: string; colorCode: string; sexoCode: string;
  padreId: number | null; madreId: number | null;
  granjaId: number; observaciones: string | null;
  fechaRegistro: string; createdAt: string; updatedAt: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class VacunosApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private get baseUrl() { return `${this.apiBaseUrl}/vacuno`; }

  listarVacunos(params: VacunosQueryParams = {}): Observable<PaginatedResult<Vacuno>> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.query?.trim()) httpParams = httpParams.set('query', params.query.trim());
    if (params.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);

    return this.http
      .get<any>(this.baseUrl, { params: httpParams })
      .pipe(
        map((response) => {
          let items: Vacuno[] = [];

          if (response.data && Array.isArray(response.data)) {
            items = response.data.map((v: BackendVacunoItem) =>
              VacunoMapper.fromBackendItem(v)
            );
          }

          const limit = response.limit || params.limit || 20;
          const totalCount = response.totalCount ?? items.length;

          return {
            items,
            totalItems: totalCount,
            paginaActual: response.page ?? params.page ?? 1,
            totalPaginas: Math.ceil(totalCount / limit) || 1,
            limitePorPagina: limit,
          };
        }),
      );
  }

  obtenerVacuno(id: string | number): Observable<Vacuno> {
    return this.http
      .get<ApiResponse<BackendVacunoDetail>>(`${this.baseUrl}/${id}`)
      .pipe(
        map((r) => ({
          id: r.data.id,
          codigo: r.data.codigo,
          nombre: r.data.nombre,
          fechaNacimiento: r.data.fechaNacimiento,
          raza: r.data.razaCode,
          color: r.data.colorCode,
          sexo: r.data.sexoCode,
          observaciones: r.data.observaciones ?? undefined,
          estado: 'activo',
          distrito: '',
          fechaRegistro: new Date()
        })),
      );
  }

  registrarVacuno(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse> {
    const body = {
      codigo: data.codigo,
      nombre: data.nombre,
      fechaNacimiento: data.fechaNacimiento,
      tipoAdquisicionCode: data.adquisicionPor,
      razaCode: data.raza,
      colorCode: data.color,
      sexoCode: data.sexo,
      observaciones: data.observaciones?.trim() ?? null,
    };
    return this.http
      .post<ApiResponse<RegistrarVacunoResponse>>(this.baseUrl, body)
      .pipe(map((r) => r.data));
  }

  actualizarVacuno(id: string | number, data: RegistrarVacunoRequest): Observable<Vacuno> {
    const body = {
      nombre: data.nombre,
      fechaNacimiento: data.fechaNacimiento,
      tipoAdquisicionCode: data.adquisicionPor,
      razaCode: data.raza,
      colorCode: data.color,
      sexoCode: data.sexo,
      observaciones: data.observaciones?.trim() ?? null,
    };
    return this.http
      .patch<ApiResponse<BackendVacunoDetail>>(`${this.baseUrl}/${id}`, body)
      .pipe(
        map((r) => ({
          id: r.data.id,
          codigo: r.data.codigo,
          nombre: r.data.nombre,
          fechaNacimiento: r.data.fechaNacimiento,
          raza: r.data.razaCode,
          color: r.data.colorCode,
          sexo: r.data.sexoCode,
          observaciones: r.data.observaciones ?? undefined,
          estado: 'activo',
          distrito: '',
          fechaRegistro: new Date()
        })),
      );
  }

  eliminarVacuno(id: string | number, motivoEliminacion: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      body: { motivoEliminacion },
    });
  }

  obtenerOpciones(): Observable<VacunoOptionsResponse> {
    return this.http.get<VacunoOptionsResponse>(`${this.baseUrl}/options`);
  }

  getActivityStats(fechaInicio: string, fechaFin: string): Observable<VacunoActivityStatsDto> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<VacunoActivityStatsDto>(
      `${this.baseUrl}/estadisticas/actividad`, { params },
    );
  }

  getGenealogia(codigoOId: string | number, niveles: number): Observable<VacunoGenealogiaDto> {
    const params = new HttpParams().set('niveles', Math.max(1, Math.min(4, niveles)));
    return this.http.get<VacunoGenealogiaDto>(
      `${this.baseUrl}/${encodeURIComponent(String(codigoOId))}/genealogia`, { params },
    );
  }

  exportarArbolExcel(id: number, niveles: number = 4): Observable<Blob> {
    const params = new HttpParams().set('niveles', niveles);
    return this.http.get(`${this.baseUrl}/${id}/genealogia/exportar`, {
      params,
      responseType: 'blob',
    });
  }
}
