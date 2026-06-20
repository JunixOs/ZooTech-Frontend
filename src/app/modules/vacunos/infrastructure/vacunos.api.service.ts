import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '@core/api/api.config';
import { PaginatedResult } from '@shared/models/pagination.model';
import { VACUNO_REQUIREMENTS_CONFIG } from '../config/vacuno-requirements.config';
import {
  EditarVacunoRequest,
  RegistrarVacunoRequest,
  RegistrarVacunoResponse,
  Vacuno,
  VacunoCatalogs,
} from '../domain/models/vacuno.model';

export interface VacunosQueryParams {
  page?: number;
  limit?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'activo' | 'eliminado' | 'vivo' | 'muerto';
  q?: string;
}

export interface VacunoActivityPointDto {
  fecha: string;
  cantidad: number;
}

export interface VacunoActivityStatsDto {
  fechaInicio: string;
  fechaFin: string;
  points: VacunoActivityPointDto[];
  mayor: number;
  menor: number;
}

export interface VacunoGenealogiaDto {
  id: number;
  codigo: string;
  nombre: string;
  raza: string;
  procedencia: string;
  sexo: string;
  nivel: number;
  padre: VacunoGenealogiaDto | null;
  madre: VacunoGenealogiaDto | null;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  errorMessage: string | null;
}

interface BackendVacunoItem {
  id: number;
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  razaCode: string;
  sexoCode: string;
  procedencia: string | null;
}

interface BackendVacunoDetail extends BackendVacunoItem {
  tipoAdquisicionCode: string;
  colorCode: string;
  padreId: number | null;
  madreId: number | null;
  granjaId: number;
  observaciones: string | null;
  fechaRegistro: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class VacunosApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly config = VACUNO_REQUIREMENTS_CONFIG;

  private get baseUrl(): string {
    return `${this.apiBaseUrl}/${this.config.api.resource}`;
  }

  listarVacunos(params: VacunosQueryParams = {}): Observable<PaginatedResult<Vacuno>> {
    return this.http.get<ApiResponse<BackendVacunoItem[]>>(this.baseUrl).pipe(
      map((response) => this.paginate(this.filter(response.data.map((item) => this.normalize(item)), params), params)),
    );
  }

  obtenerVacuno(id: string | number): Observable<Vacuno> {
    return this.http.get<ApiResponse<BackendVacunoDetail>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => this.normalize(response.data)),
    );
  }

  obtenerCatalogos(): Observable<VacunoCatalogs> {
    return this.http.get<ApiResponse<VacunoCatalogs>>(`${this.baseUrl}/${this.config.api.catalogs}`).pipe(
      map((response) => response.data),
    );
  }

  registrarVacuno(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse> {
    return this.http.post<ApiResponse<BackendVacunoDetail>>(this.baseUrl, data).pipe(
      map((response) => this.normalize(response.data)),
    );
  }

  actualizarVacuno(id: string | number, data: EditarVacunoRequest): Observable<Vacuno> {
    return this.http.patch<ApiResponse<BackendVacunoDetail>>(`${this.baseUrl}/${id}`, data).pipe(
      map((response) => this.normalize(response.data)),
    );
  }

  eliminarVacuno(id: string | number, motivoEliminacion: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      body: { motivoEliminacion },
    });
  }

  getActivityStats(fechaInicio: string, fechaFin: string): Observable<VacunoActivityStatsDto> {
    const params = new HttpParams()
      .set(this.config.api.queryKeys.fechaInicio, fechaInicio)
      .set(this.config.api.queryKeys.fechaFin, fechaFin);
    return this.http.get<VacunoActivityStatsDto>(`${this.baseUrl}/${this.config.api.activityStats}`, { params });
  }

  getGenealogia(id: string | number, niveles: number): Observable<VacunoGenealogiaDto> {
    const params = new HttpParams().set(
      this.config.api.queryKeys.niveles,
      Math.max(
        this.config.settings.VACUNOS_ARBOL_MIN_NIVELES,
        Math.min(this.config.settings.VACUNOS_ARBOL_MAX_NIVELES, niveles),
      ),
    );
    return this.http.get<VacunoGenealogiaDto>(
      `${this.baseUrl}/${id}/${this.config.api.genealogia}`,
      { params },
    );
  }

  private normalize(item: BackendVacunoItem | BackendVacunoDetail): Vacuno {
    const detail = item as Partial<BackendVacunoDetail>;

    return {
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      fechaNacimiento: item.fechaNacimiento,
      tipoAdquisicionCode: detail.tipoAdquisicionCode ?? '',
      razaCode: item.razaCode,
      colorCode: detail.colorCode ?? '',
      sexoCode: item.sexoCode,
      padreId: detail.padreId ?? null,
      madreId: detail.madreId ?? null,
      granjaId: detail.granjaId ?? 0,
      observaciones: detail.observaciones ?? undefined,
      fechaRegistro: detail.fechaRegistro,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
      procedencia: item.procedencia ?? undefined,
      estado: 'activo',
      adquisicionPor: detail.tipoAdquisicionCode,
      raza: item.razaCode,
      color: detail.colorCode,
      sexo: item.sexoCode,
      codigoPadre: detail.padreId ? String(detail.padreId) : '',
      codigoMadre: detail.madreId ? String(detail.madreId) : '',
      granja: detail.granjaId ? String(detail.granjaId) : item.procedencia ?? '',
      distrito: item.procedencia ?? '',
    };
  }

  private filter(items: Vacuno[], params: VacunosQueryParams): Vacuno[] {
    const query = params.q?.trim().toLocaleLowerCase() ?? '';

    return items.filter((item) => {
      const matchesQuery = !query || [
        item.codigo,
        item.nombre,
        item.raza,
        item.procedencia ?? '',
      ].some((value) => value.toLocaleLowerCase().includes(query));
      const matchesFrom = !params.fechaDesde || item.fechaNacimiento >= params.fechaDesde;
      const matchesTo = !params.fechaHasta || item.fechaNacimiento <= params.fechaHasta;
      const matchesState = !params.estado || params.estado === 'activo' || params.estado === 'vivo';
      return matchesQuery && matchesFrom && matchesTo && matchesState;
    });
  }

  private paginate(items: Vacuno[], params: VacunosQueryParams): PaginatedResult<Vacuno> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 10);
    const start = (page - 1) * limit;

    return {
      items: items.slice(start, start + limit),
      totalItems: items.length,
      paginaActual: page,
      totalPaginas: Math.max(1, Math.ceil(items.length / limit)),
      limitePorPagina: limit,
    };
  }
}
