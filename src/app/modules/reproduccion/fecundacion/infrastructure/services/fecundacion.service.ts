import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs';

import { API_BASE_URL } from '@core/api/api.config';
import {
  CreateFecundacionRequest,
  CreateFecundacionResponse,
  FecundacionEdit,
  FecundacionOptions,
  FecundacionRegistro,
  FecundacionUpdateResponse,
  FecundacionVacunoOption,
  UpdateFecundacionRequest,
} from '../../domain/models/fecundacion.model';

export interface FecundacionesQueryParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  query?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  resultado?: string;
}

interface BackendListEnvelope {
  data: FecundacionRegistro[];
  page: number;
  pageSize?: number;
  limit: number;
  totalCount: number;
  success: boolean;
  errorMessage: string | null;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  errorMessage: string | null;
}

import { FecundacionRepository } from '../../domain/interfaces/fecundacion-repository.interface';

@Injectable({ providedIn: 'root' })
export class FecundacionService implements FecundacionRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private get baseUrl() { return `${this.apiBaseUrl}/fecundaciones`; }

  listarFecundaciones(params: FecundacionesQueryParams = {}): Observable<BackendListEnvelope> {
    let httpParams = new HttpParams();
    const search = params.search ?? params.query;
    const pageSize = params.pageSize ?? params.limit;

    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (pageSize) httpParams = httpParams.set('pageSize', String(pageSize));
    if (search?.trim()) httpParams = httpParams.set('search', search.trim());
    if (params.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);
    if (params.resultado?.trim()) httpParams = httpParams.set('resultado', params.resultado.trim());

    return this.http.get<BackendListEnvelope>(this.baseUrl, { params: httpParams });
  }

  crear(payload: CreateFecundacionRequest): Observable<CreateFecundacionResponse> {
    return this.http
      .post<ApiResponse<CreateFecundacionResponse>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  obtenerParaEditar(id: number): Observable<FecundacionEdit> {
    return this.http
      .get<ApiResponse<FecundacionEdit>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  obtenerOpciones(): Observable<FecundacionOptions> {
    return this.http
      .get<ApiResponse<FecundacionOptions>>(`${this.baseUrl}/opciones`)
      .pipe(map((response) => response.data));
  }

  buscarVacunos(
    sexo: 'hembra' | 'macho',
    q = '',
    soloDisponibles = false,
    excluirFecundacionId: number | null = null,
  ): Observable<FecundacionVacunoOption[]> {
    let params = new HttpParams().set('sexo', sexo);
    if (q.trim()) params = params.set('q', q.trim());
    if (soloDisponibles) params = params.set('soloDisponibles', 'true');
    if (excluirFecundacionId) params = params.set('excluirFecundacionId', String(excluirFecundacionId));

    return this.http
      .get<ApiResponse<FecundacionVacunoOption[]>>(`${this.baseUrl}/vacunos`, { params })
      .pipe(map((response) => response.data ?? []));
  }

  actualizar(id: number, payload: UpdateFecundacionRequest): Observable<FecundacionUpdateResponse> {
    return this.http
      .patch<ApiResponse<FecundacionUpdateResponse>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  eliminar(id: number, razon: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      body: { razon },
    });
  }
}
