import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  PesoPromedioItem,
  ResumenSanidad,
  TipoPesoCountItem,
} from '../domain/models/reportes-sanidad.model';

type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };

@Injectable({ providedIn: 'root' })
export class ReportesSanidadApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/triaje/reportes`;

  getResumen(fechaInicio?: string, fechaFin?: string): Observable<ResumenSanidad> {
    const params: Record<string, string> = {};
    if (fechaInicio) params['fechaInicio'] = fechaInicio;
    if (fechaFin) params['fechaFin'] = fechaFin;
    return this.http
      .get<ApiResponse<ResumenSanidad>>(`${this.baseUrl}/resumen`, { params })
      .pipe(map((r) => r.data));
  }

  getPesoPromedio(fechaInicio?: string, fechaFin?: string): Observable<PesoPromedioItem[]> {
    const params: Record<string, string> = {};
    if (fechaInicio) params['fechaInicio'] = fechaInicio;
    if (fechaFin) params['fechaFin'] = fechaFin;
    return this.http
      .get<ApiResponse<PesoPromedioItem[]>>(`${this.baseUrl}/peso-promedio`, { params })
      .pipe(map((r) => r.data));
  }

  getDistribucionTipoPeso(fechaInicio?: string, fechaFin?: string): Observable<TipoPesoCountItem[]> {
    const params: Record<string, string> = {};
    if (fechaInicio) params['fechaInicio'] = fechaInicio;
    if (fechaFin) params['fechaFin'] = fechaFin;
    return this.http
      .get<ApiResponse<TipoPesoCountItem[]>>(`${this.baseUrl}/distribucion-tipo-peso`, { params })
      .pipe(map((r) => r.data));
  }
}
