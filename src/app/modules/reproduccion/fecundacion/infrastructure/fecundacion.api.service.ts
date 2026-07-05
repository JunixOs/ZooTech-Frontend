import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/api/api.config';
import { FecundacionRegistro } from '../domain/models/fecundacion.model';

export interface FecundacionesQueryParams {
  page?: number;
  limit?: number;
  query?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  resultado?: string;
}

interface BackendListEnvelope {
  data: FecundacionRegistro[];
  page: number;
  limit: number;
  totalCount: number;
  success: boolean;
  errorMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class FecundacionApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private get baseUrl() { return `${this.apiBaseUrl}/fecundacion`; }

  listarFecundaciones(params: FecundacionesQueryParams = {}): Observable<BackendListEnvelope> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));
    if (params.query?.trim()) httpParams = httpParams.set('query', params.query.trim());
    if (params.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);
    if (params.resultado?.trim()) httpParams = httpParams.set('resultado', params.resultado.trim());

    return this.http.get<BackendListEnvelope>(this.baseUrl, { params: httpParams });
  }
}
