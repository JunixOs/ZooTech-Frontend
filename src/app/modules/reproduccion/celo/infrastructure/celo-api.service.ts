import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '@env/environment';
import {
  CeloRegistro,
  ComparacionRealVsEstandar,
  EditarCeloPayload,
  EliminarCeloPayload,
  RegistrarCeloRequest,
  VacaCelo,
} from '../domain/models/celo.model';
import {
  ComparacionCelosPorVacuno,
  DetalleCeloPorVacuno,
  ReporteCeloPorVacuno,
} from '../domain/models/reporte-celo-vacuno.model';
import { ApiResponse, validateApiResponse } from '@shared/models/api-response.model';

/**
 * Servicio de infraestructura para el módulo de Celo.
 *
 * Responsabilidad ÚNICA: comunicarse con el backend para operaciones de celo.
 * No contiene lógica de negocio ni estado de la UI.
 */
@Injectable({
  providedIn: 'root',
})
export class CeloApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/celo`;

  constructor(private http: HttpClient) { }

  listarCelos(
    search?: string,
    page?: number,
    pageSize?: number,
    fechaInicio?: string,
    fechaFin?: string,
    columnFilters?: Record<string, string>,
  ): Observable<{ data: CeloRegistro[]; totalCount: number }> {
    let params = new HttpParams();

    if (search) params = params.set('search', search);
    if (page) params = params.set('page', page);
    if (pageSize) params = params.set('pageSize', pageSize);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (columnFilters) {
      for (const [key, value] of Object.entries(columnFilters)) {
        if (value) params = params.set(`columnFilters[${key}]`, value);
      }
    }

    return this.http
      .get<ApiResponse<{ data: CeloRegistro[]; pagination: { total: number } }>>(this.baseUrl, {
        params,
      })
      .pipe(
        map(validateApiResponse),
        map((response) => ({
          data: response.data.data,
          totalCount: response.data.pagination.total,
        })),
        catchError((err) => {
          console.error('[CeloApiService] Error al listar celos:', err);
          return throwError(() => err);
        }),
      );
  }

  obtenerReporteCeloGeneral(
    search?: string,
    page?: number,
    pageSize?: number,
    fechaInicio?: string,
    fechaFin?: string,
    columnFilters?: Record<string, string>,
  ): Observable<{ data: CeloRegistro[]; totalCount: number }> {
    let params = new HttpParams();

    if (search) params = params.set('search', search);
    if (page) params = params.set('page', page);
    if (pageSize) params = params.set('pageSize', pageSize);
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (columnFilters) {
      for (const [key, value] of Object.entries(columnFilters)) {
        if (value) params = params.set(`columnFilters[${key}]`, value);
      }
    }

    return this.http
      .get<ApiResponse<{ data: CeloRegistro[]; pagination: { total: number } }>>(
        `${this.baseUrl}/reportes/general`,
        { params },
      )
      .pipe(
        map(validateApiResponse),
        map((response) => ({
          data: response.data.data,
          totalCount: response.data.pagination.total,
        })),
        catchError((err) => {
          console.error('[CeloApiService] Error al obtener reporte de celo general:', err);
          return throwError(() => err);
        }),
      );
  }

  obtenerReporteCeloPorVacuno(
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<ReporteCeloPorVacuno[]> {
    let params = new HttpParams();

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http
      .get<ApiResponse<ReporteCeloPorVacuno[]>>(`${this.baseUrl}/reportes/por-vacuno`, { params })
      .pipe(
        map(validateApiResponse),
        map((response) => response.data),
        catchError((err) => {
          console.error('[CeloApiService] Error al obtener reporte de celo por vacuno:', err);
          return throwError(() => err);
        }),
      );
  }

  obtenerDetalleCeloPorVacuno(codigoVacuno: string): Observable<DetalleCeloPorVacuno[]> {
    return this.http
      .get<ApiResponse<DetalleCeloPorVacuno[]>>(
        `${this.baseUrl}/reportes/por-vacuno/${codigoVacuno}`,
      )
      .pipe(
        map(validateApiResponse),
        map((response) => response.data),
        catchError((err) => {
          console.error('[CeloApiService] Error al obtener detalle de celo por vacuno:', err);
          return throwError(() => err);
        }),
      );
  }

  listarVacasEnCelo(fechaInicio?: string, fechaFin?: string): Observable<VacaCelo[]> {
    let params = new HttpParams();

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http
      .get<ApiResponse<VacaCelo[]>>(`${this.baseUrl}/vacas-en-celo`, { params })
      .pipe(
        map(validateApiResponse),
        map(response => response.data),
      );
  }

  obtenerComparacionPorVacuno(
    codigoVacuno: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<ComparacionCelosPorVacuno[]> {
    let params = new HttpParams();

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http
      .get<ApiResponse<ComparacionCelosPorVacuno[]>>(
        `${this.baseUrl}/reportes/comparacion-por-vacuno/${codigoVacuno}`,
        { params },
      )
      .pipe(
        map(validateApiResponse),
        map(response => response.data),
        catchError((err) => {
          console.error('[CeloApiService] Error al obtener comparación por vacuno:', err);
          return throwError(() => err);
        }),
      );
  }

  registrarCelo(data: RegistrarCeloRequest): Observable<CeloRegistro> {
    return this.http.post<ApiResponse<CeloRegistro>>(this.baseUrl, data).pipe(
      map(validateApiResponse),
      map(response => response.data),
    );
  }

  actualizarCelo(data: EditarCeloPayload): Observable<CeloRegistro> {
    const { id, ...body } = data;

    return this.http
      .put<ApiResponse<CeloRegistro>>(`${this.baseUrl}/${id}`, body)
      .pipe(
        map(validateApiResponse),
        map(response => response.data),
      );
  }

  eliminarCelo(data: EliminarCeloPayload): Observable<void> {
    const { id, motivoEliminacion } = data;

    return this.http
      .delete<void>(`${this.baseUrl}/${id}`, {
        body: { motivoEliminacion },
      });
  }

  listarComparacionRealVsEstandar(
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<ComparacionRealVsEstandar[]> {

    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http
      .get<ApiResponse<ComparacionRealVsEstandar[]>>(
        `${this.baseUrl}/reportes/comparacion-real-vs-estandar`,
        { params },
      )
      .pipe(
        map(validateApiResponse),
        map(response => response.data),
      );
  }
}
