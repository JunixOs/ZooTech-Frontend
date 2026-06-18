import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '@core/api/api.config';
import { PaginatedResult } from '@shared/models/pagination.model';
import { RegistrarVacunoRequest, RegistrarVacunoResponse, Vacuno } from '../domain/models/vacuno.model';

// ─── Query params ────────────────────────────────────────────────────────────
export interface VacunosQueryParams {
  page?: number;
  limit?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'activo' | 'eliminado';
  q?: string;
}

// ─── Extras (reportes – endpoints aún no disponibles en backend) ──────────────
export interface VacunoActivityPointDto { fecha: string; cantidad: number; }
export interface VacunoActivityStatsDto {
  fechaInicio: string; fechaFin: string;
  points: VacunoActivityPointDto[]; mayor: number; menor: number;
}
export interface VacunoGenealogiaDto {
  id: number; codigo: string; nombre: string; raza: string;
  procedencia: string; sexo: string; nivel: number;
  padre: VacunoGenealogiaDto | null; madre: VacunoGenealogiaDto | null;
}
export interface UbigeoOption { codigo: string; nombre: string; hijos: UbigeoOption[]; }
export interface VacunoOptionsResponse {
  adquisicionOptions: string[]; razaOptions: string[];
  sexoOptions: string[]; aptoParaOptions: string[];
  ubigeoOptions?: UbigeoOption[];
}
export interface GranjaOption {
  id: number;
  nombre: string;
  codigoDistrito: string;
  distrito: string | null;
  provincia: string | null;
  departamento: string | null;
}

// ─── Backend response shapes ─────────────────────────────────────────────────
type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };

interface BackendVacunoItem {
  id: number;
  codigo: string;
  nombre: string;
  razaCode: string;
  sexoCode: string;
  fechaNacimiento: string;
  procedencia?: string;
  estado: 'activo' | 'eliminado';
}

interface BackendVacunoDetail {
  id: number; codigo: string; nombre: string;
  fechaNacimiento: string; tipoAdquisicionCode: string;
  razaCode: string; colorCode: string; sexoCode: string;
  padreId: number | null; madreId: number | null;
  granjaId: number; observaciones: string | null;
  fechaRegistro: string; createdAt: string; updatedAt: string;
  codigoPadre?: string | null;
  codigoMadre?: string | null;
  granja?: string | null;
  distrito?: string | null;
  provincia?: string | null;
  departamento?: string | null;
  codigoDistrito?: string | null;
}

// ─── Service ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class VacunosApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private get baseUrl() { return `${this.apiBaseUrl}/vacuno`; }

  listarVacunos(params: VacunosQueryParams = {}): Observable<PaginatedResult<Vacuno>> {
    let httpParams = new HttpParams();

    if (params.q?.trim()) httpParams = httpParams.set('q', params.q.trim());
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);

    return this.http
      .get<ApiResponse<BackendVacunoItem[]>>(this.baseUrl, { params: httpParams })
      .pipe(
        map((response) => {
          const allItems: Vacuno[] = response.data.map((v) => ({
            id: v.id,
            codigo: v.codigo,
            nombre: v.nombre,
            fechaNacimiento: v.fechaNacimiento,
            raza: v.razaCode,
            sexo: v.sexoCode,
            estado: v.estado,
            distrito: '',
            procedencia: v.procedencia,
            fechaRegistroFuncion: v.fechaNacimiento,
          }));

          const page = params.page ?? 1;
          const limit = params.limit ?? 10;
          const totalItems = allItems.length;
          const totalPages = Math.ceil(totalItems / limit);
          const startIndex = (page - 1) * limit;
          const items = allItems.slice(startIndex, startIndex + limit);

          return {
            items,
            totalItems,
            paginaActual: page,
            totalPaginas: totalPages,
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
          adquisicionPor: r.data.tipoAdquisicionCode,
          raza: r.data.razaCode,
          color: r.data.colorCode,
          sexo: r.data.sexoCode,
          codigoPadre: r.data.codigoPadre ?? undefined,
          codigoMadre: r.data.codigoMadre ?? undefined,
          granjaId: r.data.granjaId,
          granja: r.data.granja ?? undefined,
          distrito: r.data.distrito ?? '',
          provincia: r.data.provincia ?? '',
          departamento: r.data.departamento ?? '',
          observaciones: r.data.observaciones ?? undefined,
          estado: 'activo',
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
      codigoPadre: data.codigoPadre || null,
      codigoMadre: data.codigoMadre || null,
      granjaId: data.granjaId ?? null,
      granja: null,
      distrito: null,
      provincia: null,
      departamento: null,
      codigoDistrito: null,
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
      codigoPadre: data.codigoPadre || null,
      codigoMadre: data.codigoMadre || null,
      granjaId: data.granjaId ?? null,
      granja: null,
      distrito: null,
      provincia: null,
      departamento: null,
      codigoDistrito: null,
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
          adquisicionPor: r.data.tipoAdquisicionCode,
          raza: r.data.razaCode,
          color: r.data.colorCode,
          sexo: r.data.sexoCode,
          codigoPadre: r.data.codigoPadre ?? undefined,
          codigoMadre: r.data.codigoMadre ?? undefined,
          granjaId: r.data.granjaId,
          granja: r.data.granja ?? undefined,
          distrito: r.data.distrito ?? '',
          provincia: r.data.provincia ?? '',
          departamento: r.data.departamento ?? '',
          observaciones: r.data.observaciones ?? undefined,
          estado: 'activo',
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

  listarGranjas(): Observable<GranjaOption[]> {
    return this.http.get<GranjaOption[]>(`${this.baseUrl}/granjas`);
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
}
