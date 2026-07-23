import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/api/api.config';
import { map, Observable, throwError } from 'rxjs';
import {
  ReporteArchivoDescargado,
  RegistroVacunoReporteResponse,
  ReporteFormato,
  ReporteVacunoListadoFiltros,
  ReporteVacunoListadoResponse,
} from '../../domain/models/reporte-vacuno.model';

@Injectable({ providedIn: 'root' })
export class ReporteVacunoService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listar(filtros: ReporteVacunoListadoFiltros): Observable<ReporteVacunoListadoResponse> {
    let params = new HttpParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<ReporteVacunoListadoResponse>(`${this.apiBaseUrl}/vacunos/reportes/listado`, {
      params,
    });
  }

  obtenerRegistro(vacunoId: number, formato: ReporteFormato): Observable<RegistroVacunoReporteResponse> {
    const params = new HttpParams().set('formato', formato);

    return this.http.get<RegistroVacunoReporteResponse>(`${this.apiBaseUrl}/vacunos/${vacunoId}/reporte`, {
      params,
    });
  }

  descargarArchivo(downloadUrl: string): Observable<ReporteArchivoDescargado> {
    const absoluteUrl = this.toAbsoluteDownloadUrl(downloadUrl);
    if (!absoluteUrl) {
      return throwError(() => new Error('La URL de descarga del reporte no es válida.'));
    }

    return this.http.get(absoluteUrl, { responseType: 'blob' }).pipe(
      map((blob) => ({
        blob,
        fileName: this.getDownloadFileName(downloadUrl),
      })),
    );
  }

  toAbsoluteDownloadUrl(downloadUrl: string | null): string | null {
    if (!downloadUrl) return null;
    if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) return downloadUrl;
    return `${this.getDownloadBaseUrl()}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
  }

  private getDownloadBaseUrl(): string {
    return this.apiBaseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
  }

  private getDownloadFileName(downloadUrl: string): string {
    const pathWithoutQuery = downloadUrl.split(/[?#]/, 1)[0];
    const encodedFileName = pathWithoutQuery.split('/').filter(Boolean).at(-1);

    if (!encodedFileName) {
      return 'reporte_vacunos';
    }

    try {
      return decodeURIComponent(encodedFileName);
    } catch {
      return encodedFileName;
    }
  }
}
