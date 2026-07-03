import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class TriajeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/triaje`;

  create(payload: RegistrarTriajePayload): Observable<Triaje> {
    return this.http.post<Triaje>(this.apiUrl, payload);
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
    },
  ): Observable<PagedResponse<Triaje>> {
    const params: Record<string, string | number> = { pagina, tamano };
    if (filters?.fecha) params['fecha'] = filters.fecha;
    if (filters?.fechaInicio) params['fechaInicio'] = filters.fechaInicio;
    if (filters?.fechaFin) params['fechaFin'] = filters.fechaFin;
    if (filters?.codigo) params['codigo'] = filters.codigo;
    if (filters?.nombre) params['nombre'] = filters.nombre;
    if (filters?.tipoPeso) params['tipoPeso'] = filters.tipoPeso;
    if (filters?.pesoKg) params['pesoKg'] = filters.pesoKg;

    return this.http.get<PagedResponse<Triaje>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Triaje> {
    return this.http.get<Triaje>(`${this.apiUrl}/${id}`);
  }

  update(id: number, payload: ActualizarTriajePayload): Observable<Triaje> {
    return this.http.put<Triaje>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number, payload: EliminarTriajePayload): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { body: payload });
  }

  getTiposPeso(): Observable<TriajeTipoPesoOption[]> {
    return this.http.get<TriajeTipoPesoOption[]>(`${this.apiUrl}/tipos-peso`);
  }

  getVacunos(): Observable<TriajeVacunoOption[]> {
    return this.http.get<TriajeVacunoOption[]>(`${this.apiUrl}/vacunos`);
  }

  getHistorialByVacunoId(
    vacunoId: number,
    desde?: string,
    hasta?: string,
  ): Observable<TriajeHistorialItem[]> {
    const params: Record<string, string> = {};
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;
    return this.http.get<TriajeHistorialItem[]>(`${this.apiUrl}/historial/${vacunoId}`, { params });
  }
  getHistorialGeneral(
    desde?: string,
    hasta?: string,
  ): Observable<TriajeHistorialItem[]> {
    const params: Record<string, string> = {};
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;
    return this.http.get<TriajeHistorialItem[]>(`${this.apiUrl}/historial-general`, { params });
  }
}
