import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/api/api.config';
import { Observable } from 'rxjs';
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

    return this.http.get<ReporteVacunoListadoResponse>(
      `${this.apiBaseUrl}/vacunos/reportes/listado`,
      {
        params,
      },
    );
  }

  obtenerRegistro(
    vacunoId: number,
    formato: ReporteFormato,
  ): Observable<RegistroVacunoReporteResponse> {
    const params = new HttpParams().set('formato', formato);

    return this.http.get<RegistroVacunoReporteResponse>(
      `${this.apiBaseUrl}/vacunos/${vacunoId}/reporte`,
      {
        params,
      },
    );
  }

  toAbsoluteDownloadUrl(downloadUrl: string | null): string | null {
    if (!downloadUrl) return null;
    if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) return downloadUrl;
    return `${this.getDownloadBaseUrl()}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
  }

  private getDownloadBaseUrl(): string {
    return this.apiBaseUrl.replace(/\/api\/?$/, '');
  }
}
