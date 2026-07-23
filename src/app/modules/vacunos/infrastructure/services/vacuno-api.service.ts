import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Vacuno } from '../../domain/models/vacuno.model';

type ApiEnvelope<T> = { data?: T; Data?: T };

@Injectable({ providedIn: 'root' })
export class VacunoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl || '/api/v1'}/vacunos`;

  /**
   * Eliminar un vacuno enviando el motivo a la API REST: DELETE /api/v1/vacunos/{id}
   */
  eliminarVacuno(id: number | string, motivo: string): Observable<void> {
    const params = new HttpParams().set('motivo', motivo);
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(String(id))}`, { params });
  }

  /**
   * Obtener listado de vacunos desde la API REST: GET /api/v1/vacunos
   */
  obtenerVacunos(): Observable<Vacuno[]> {
    return this.http.get<ApiEnvelope<Vacuno[]> | Vacuno[]>(this.baseUrl).pipe(
      map((res) => {
        if ('data' in res && res.data) return res.data;
        if ('Data' in res && res.Data) return res.Data;
        return res as Vacuno[];
      }),
    );
  }

  /**
   * Obtener un vacuno por código/id desde la API REST: GET /api/v1/vacunos/{id}
   */
  obtenerPorId(identifier: string): Observable<Vacuno> {
    return this.http.get<ApiEnvelope<Vacuno> | Vacuno>(`${this.baseUrl}/${encodeURIComponent(identifier)}`).pipe(
      map((res) => {
        if ('data' in res && res.data) return res.data;
        if ('Data' in res && res.Data) return res.Data;
        return res as Vacuno;
      }),
    );
  }
}
