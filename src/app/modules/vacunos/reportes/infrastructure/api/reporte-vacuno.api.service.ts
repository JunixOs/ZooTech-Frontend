import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/api/api.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  RegistroVacunoReporteResponse,
  ReporteFormato,
  ReporteVacunoListadoFiltros,
  ReporteVacunoListadoResponse,
} from '../../domain/models/reporte-vacuno.model';

@Injectable({ providedIn: 'root' })
export class ReporteVacunoApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listar(filtros: ReporteVacunoListadoFiltros): Observable<ReporteVacunoListadoResponse> {
    let params = new HttpParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<ApiEnvelope<ReporteVacunoListadoResponse> | ReporteVacunoListadoResponse>(
      `${this.apiBaseUrl}/vacuno/reportes/listado`,
      {
        params,
      },
    ).pipe(map((response) => unwrapApiResponse(response)));
  }

  obtenerRegistro(
    vacunoId: number,
    formato: ReporteFormato,
  ): Observable<RegistroVacunoReporteResponse> {
    const params = new HttpParams().set('formato', formato);

    return this.http.get<ApiEnvelope<RegistroVacunoReporteResponse> | RegistroVacunoReporteResponse>(
      `${this.apiBaseUrl}/vacuno/${vacunoId}/reporte`,
      {
        params,
      },
    ).pipe(map((response) => unwrapApiResponse(response)));
  }

  toAbsoluteDownloadUrl(downloadUrl: string | null): string | null {
    if (!downloadUrl) return null;
    if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) return downloadUrl;
    return `${this.getDownloadBaseUrl()}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
  }

  private getDownloadBaseUrl(): string {
    try {
      return new URL(this.apiBaseUrl).origin;
    } catch {
      return this.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
    }
  }
}

interface ApiEnvelope<T> {
  data: T;
}

function unwrapApiResponse<T>(response: ApiEnvelope<T> | T): T {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    !Array.isArray((response as { data: unknown }).data)
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
}
