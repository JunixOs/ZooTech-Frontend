import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse, validateApiResponse } from '@shared/models/api-response.model';
import {
  FecundacionEdit,
  FecundacionOptions,
  FecundacionUpdateResponse,
  FecundacionVacunoOption,
  UpdateFecundacionRequest,
} from '../domain/models/fecundacion.model';

@Injectable({ providedIn: 'root' })
export class FecundacionApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/fecundaciones`;
  private readonly auxiliaryBaseUrl = `${environment.apiUrl}/api/v1/fecundacion`;

  constructor(private readonly http: HttpClient) {}

  obtenerParaEditar(id: number): Observable<FecundacionEdit> {
    return this.http.get<ApiResponse<FecundacionEdit>>(`${this.baseUrl}/${id}`).pipe(
      map(validateApiResponse),
      map((response) => response.data),
      catchError((err) => throwError(() => err)),
    );
  }

  obtenerOpciones(): Observable<FecundacionOptions> {
    return this.http.get<ApiResponse<FecundacionOptions>>(`${this.auxiliaryBaseUrl}/opciones`).pipe(
      map(validateApiResponse),
      map((response) => response.data),
      catchError((err) => throwError(() => err)),
    );
  }

  buscarVacunos(sexo: 'hembra' | 'macho', q = ''): Observable<FecundacionVacunoOption[]> {
    let params = new HttpParams().set('sexo', sexo);
    if (q.trim()) params = params.set('q', q.trim());

    return this.http.get<ApiResponse<FecundacionVacunoOption[]>>(`${this.auxiliaryBaseUrl}/vacunos`, { params }).pipe(
      map(validateApiResponse),
      map((response) => response.data),
      catchError((err) => throwError(() => err)),
    );
  }

  actualizar(id: number, payload: UpdateFecundacionRequest): Observable<FecundacionUpdateResponse> {
    return this.http.patch<ApiResponse<FecundacionUpdateResponse>>(`${this.baseUrl}/${id}`, payload).pipe(
      map(validateApiResponse),
      map((response) => response.data),
      catchError((err) => throwError(() => err)),
    );
  }
}
