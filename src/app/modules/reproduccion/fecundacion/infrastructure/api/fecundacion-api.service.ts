import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { FecundacionRegistro, RegistrarFecundacionRequest } from '../../domain/models/fecundacion.model';
import { ApiResponse, validateApiResponse } from '@shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class FecundacionApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/fecundaciones`;

  constructor(private http: HttpClient) {}

  registrarFecundacion(data: RegistrarFecundacionRequest): Observable<FecundacionRegistro> {
    return this.http.post<ApiResponse<FecundacionRegistro>>(this.baseUrl, data).pipe(
      map(validateApiResponse),
      map((response) => response.data),
      catchError((err) => {
        console.error('[FecundacionApiService] Error al registrar fecundación:', err);
        return throwError(() => err);
      }),
    );
  }
}
