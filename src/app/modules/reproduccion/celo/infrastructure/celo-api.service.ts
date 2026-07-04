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
import { ApiResponse, validateApiResponse } from '@shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CeloApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/celo`;

  constructor(private http: HttpClient) { }

  listarCelos(): Observable<CeloRegistro[]> {
    return this.http.get<ApiResponse<CeloRegistro[]>>(this.baseUrl).pipe(
      map(validateApiResponse),
      map(response => response.data),
      catchError(err => {
        console.error('[CeloApiService] Error al listar celos:', err);
        return throwError(() => err);
      }),
    );
  }

  listarVacasEnCelo(
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<VacaCelo[]> {

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
