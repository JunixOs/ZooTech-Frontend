import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
=======
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
>>>>>>> ARACELY_GONZALES/feature
import { environment } from '@env/environment';
import {
  CeloRegistro,
  RegistrarCeloRequest,
} from '@modules/reproduccion/celo/domain/models/celo.model';
import { ApiResponse, validateApiResponse } from '@shared/models/api-response.model';

<<<<<<< HEAD
/**
 * Servicio de infraestructura para el módulo de Celo.
 *
 * Responsabilidad ÚNICA: comunicarse con el backend para operaciones de celo.
 * No contiene lógica de negocio ni estado de la UI.
 */
=======
export interface VacaCelo {
  id: number;
  codigo: string;
  nombre: string;
  diasRestante: number;
  estado: 'En celo' | 'Próximo' | 'Pasó';
  vecesEnCelo: number;
  crias: number;
}

>>>>>>> ARACELY_GONZALES/feature
@Injectable({
  providedIn: 'root',
})
export class CeloApiService {
  private readonly baseUrl = `${environment.apiUrl}/celo`;

  constructor(private http: HttpClient) { }

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

<<<<<<< HEAD
  /** Registra un nuevo evento de celo. */
  registrarCelo(data: RegistrarCeloRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/registrar`, data).pipe(
      catchError((err) => {
        console.error('[CeloApiService] Error al registrar celo:', err);
        return throwError(() => err);
      }),
    );
=======
  listarVacasEnCelo(fechaInicio?: string, fechaFin?: string): Observable<VacaCelo[]> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http
      .get<ApiResponse<VacaCelo[]>>(`${this.baseUrl}/vacas-en-celo`, { params })
      .pipe(map(response => response.data));
  }

  registrarCelo(data: RegistrarCeloRequest) {
    return this.http.post(`${this.baseUrl}/registrar`, data);
>>>>>>> ARACELY_GONZALES/feature
  }
}
