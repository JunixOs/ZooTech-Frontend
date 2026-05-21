import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  RegistroVacunoReporteResponse,
  ReporteFormato,
  ReporteVacunoListadoFiltros,
  ReporteVacunoListadoResponse,
} from '../../domain/models/reporte-vacuno.model';

const API_BASE_URL = 'http://localhost:5085';

@Injectable({ providedIn: 'root' })
export class ReporteVacunoApiService {
  private readonly http = inject(HttpClient);

  listar(filtros: ReporteVacunoListadoFiltros): Observable<ReporteVacunoListadoResponse> {
    let params = new HttpParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<ReporteVacunoListadoResponse>(`${API_BASE_URL}/vacunos/reportes/listado`, {
      params,
    });
  }

  obtenerRegistro(vacunoId: number, formato: ReporteFormato): Observable<RegistroVacunoReporteResponse> {
    const params = new HttpParams().set('formato', formato);

    return this.http.get<RegistroVacunoReporteResponse>(`${API_BASE_URL}/vacunos/${vacunoId}/reporte`, {
      params,
    });
  }

  toAbsoluteDownloadUrl(downloadUrl: string | null): string | null {
    if (!downloadUrl) return null;
    if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) return downloadUrl;
    return `${API_BASE_URL}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
  }
}
