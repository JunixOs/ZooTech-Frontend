import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { CeloRegistro } from '../domain/models/celo.model';
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
  private readonly baseUrl = `${environment.apiUrl}/celo`;

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
}
