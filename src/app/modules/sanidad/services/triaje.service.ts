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
      nombre?: string;
      tipoPeso?: string;
      pesoKg?: number;
      fechaInicio?: string;
      fechaFin?: string;
    },
  ): Observable<PagedResponse<Triaje>> {
    const params: Record<string, string | number> = { pagina, tamano };
    if (filters?.fecha) params['fecha'] = filters.fecha;
    if (filters?.codigo) params['codigo'] = filters.codigo;
    if (filters?.nombre) params['nombre'] = filters.nombre;
    if (filters?.tipoPeso) params['tipoPeso'] = filters.tipoPeso;
    if (filters?.pesoKg) params['pesoKg'] = filters.pesoKg;
    if (filters?.fechaInicio) params['fechaInicio'] = filters.fechaInicio;
    if (filters?.fechaFin) params['fechaFin'] = filters.fechaFin;

    return this.http
      .get<ApiResponse<PagedResponse<Triaje>>>(this.apiUrl, { params })
      .pipe(map((r) => r.data));
  }

  getById(id: number): Observable<Triaje> {
    return this.http
      .get<ApiResponse<Triaje>>(`${this.apiUrl}/${id}`)
      .pipe(map((r) => r.data));
  }

  update(id: number, payload: ActualizarTriajePayload): Observable<Triaje> {
    return this.http
      .put<ApiResponse<Triaje>>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  delete(id: number, payload: EliminarTriajePayload): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { body: payload });
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

  getHistorialByVacunoId(vacunoId: number, fechaInicio?: string, fechaFin?: string): Observable<TriajeHistorialItem[]> {
    const params: Record<string, string> = {};
    if (fechaInicio) params['fechaInicio'] = fechaInicio;
    if (fechaFin) params['fechaFin'] = fechaFin;
    return this.http
      .get<ApiResponse<TriajeHistorialItem[]>>(`${this.apiUrl}/historial/${vacunoId}`, { params })
      .pipe(map((r) => r.data));
  }

  getGeneralReport(fechaInicio?: string, fechaFin?: string): Observable<Triaje[]> {
    const params: Record<string, string> = {};
    if (fechaInicio) params['fechaInicio'] = fechaInicio;
    if (fechaFin) params['fechaFin'] = fechaFin;
    return this.http
      .get<ApiResponse<Triaje[]>>(`${this.apiUrl}/reporte/general`, { params })
      .pipe(map((r) => r.data));
  }

  getReporteVacuno(vacunoId: number, fechaInicio?: string, fechaFin?: string): Observable<TriajeHistorialItem[]> {
    const params: Record<string, string> = {};
    if (fechaInicio) params['fechaInicio'] = fechaInicio;
    if (fechaFin) params['fechaFin'] = fechaFin;
    return this.http
      .get<ApiResponse<TriajeHistorialItem[]>>(`${this.apiUrl}/historial/${vacunoId}`, { params })
      .pipe(map((r) => r.data));
  }
}
