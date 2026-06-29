import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ActualizarTriajePayload,
  EliminarTriajePayload,
  PagedResponse,
  RegistrarTriajePayload,
  Triaje,
  TriajeHistorialItem,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
} from '../triaje/domain/models/triaje.model';

type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };

@Injectable({ providedIn: 'root' })
export class TriajeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/triaje`;

  create(payload: RegistrarTriajePayload): Observable<Triaje> {
    return this.http
      .post<ApiResponse<Triaje>>(this.apiUrl, payload)
      .pipe(map((r) => r.data));
  }

  getAll(
    pagina = 1,
    tamano = 10,
    filters?: {
      fecha?: string;
      codigo?: string;
      hora?: string;
      nombre?: string;
      tipoPeso?: string;
      pesoKg?: number;
      fechaInicio?: string;
      fechaFin?: string;
      vacunoId?: number;
    },
  ): Observable<PagedResponse<Triaje>> {
    const params: Record<string, string | number> = { pagina, tamano };
    if (filters?.fecha) params['fecha'] = filters.fecha;
    if (filters?.codigo) params['codigo'] = filters.codigo;
    if (filters?.nombre) params['nombre'] = filters.nombre;
    if (filters?.tipoPeso) params['tipoPeso'] = filters.tipoPeso;
    if (filters?.pesoKg) params['pesoKg'] = filters.pesoKg;
    if (filters?.vacunoId) params['vacunoId'] = filters.vacunoId;

    return this.http
      .get<ApiResponse<PagedResponse<Triaje>>>(this.apiUrl, { params })
      .pipe(map((r) => r.data));
  }

  getById(id: number): Observable<Triaje> {
    return this.http
      .get<ApiResponse<Triaje>>(`${this.apiUrl}/${id}`)
      .pipe(map((r) => r.data));
  }

  update(id: number, payload: ActualizarTriajePayload): Observable<void> {
    return this.http
      .patch<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number, payload: EliminarTriajePayload): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { body: payload });
  }

  getTiposPeso(): Observable<TriajeTipoPesoOption[]> {
    return this.http
      .get<ApiResponse<TriajeTipoPesoOption[]>>(`${this.apiUrl}/tipos-peso`)
      .pipe(map((r) => r.data));
  }

  getVacunos(): Observable<TriajeVacunoOption[]> {
    return this.http
      .get<ApiResponse<TriajeVacunoOption[]>>(`${this.apiUrl}/vacunos`)
      .pipe(map((r) => r.data));
  }

  getHistorialByVacunoId(vacunoId: number): Observable<TriajeHistorialItem[]> {
    return this.http
      .get<ApiResponse<TriajeHistorialItem[]>>(`${this.apiUrl}/historial/${vacunoId}`)
      .pipe(map((r) => r.data));
  }
}
