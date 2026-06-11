import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '@env/environment';
import {
  CeloRegistro,
  EditarCeloPayload,
  EliminarCeloPayload,
  RegistrarCeloRequest,
  VacaCelo,
} from '../domain/models/celo.model';
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

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los registros de celo.
   *
   * Flujo:
   *  1. GET al endpoint
   *  2. Valida que `success === true` (lanza error si no)
   *  3. Extrae y devuelve `response.data`
   *
   * Los errores HTTP (red, 4xx, 5xx) los captura el `errorInterceptor` global
   * y los relanza como `Error` con mensaje legible.
   */
  listarCelos(): Observable<CeloRegistro[]> {
    return this.http.get<ApiResponse<CeloRegistro[]>>(this.baseUrl).pipe(
      map(validateApiResponse),
      map((response) => response.data),
      catchError((err) => {
        console.error('[CeloApiService] Error al listar celos:', err);
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
        map((response) => response.data),
        catchError((err) => {
          console.error('[CeloApiService] Error al listar vacas en celo:', err);
          return throwError(() => err);
        }),
      );
  }

  /** Registra un nuevo evento de celo. */
  registrarCelo(data: RegistrarCeloRequest): Observable<CeloRegistro> {
    return this.http.post<ApiResponse<CeloRegistro>>(this.baseUrl, data).pipe(
      map(validateApiResponse),
      map((response) => response.data),
      catchError((err) => {
        console.error('[CeloApiService] Error al registrar celo:', err);
        return throwError(() => err);
      }),
    );
  }

  actualizarCelo(data: EditarCeloPayload): Observable<CeloRegistro> {
    const { id, ...body } = data;
    return this.http.put<ApiResponse<CeloRegistro>>(`${this.baseUrl}/${id}`, body).pipe(
      map(validateApiResponse),
      map((response) => response.data),
      catchError((err) => {
        console.error('[CeloApiService] Error al actualizar celo:', err);
        return throwError(() => err);
      }),
    );
  }

  eliminarCelo(data: EliminarCeloPayload): Observable<void> {
    const { id, motivoEliminacion } = data;
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      body: { motivoEliminacion },
    }).pipe(
      catchError((err) => {
        console.error('[CeloApiService] Error al eliminar celo:', err);
        return throwError(() => err);
      }),
    );
  }
}
