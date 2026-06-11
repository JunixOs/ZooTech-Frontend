import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment.development';
import { Triaje, RegistrarTriajePayload, TriajeTipoPesoOption, TriajeVacunoOption, TriajeHistorialItem, EliminarTriajePayload, PagedResponse, ActualizarTriajePayload } from '../triaje/domain/models/triaje.model';

@Injectable({
  providedIn: 'root',
})
export class TriajeService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/triaje`;

  constructor(private http: HttpClient) {}

  create(payload: RegistrarTriajePayload): Observable<Triaje> {
    return this.http.post<Triaje>(this.apiUrl, payload);
  }

getAll(
  pagina: number = 1,
  tamano: number = 10,
  filters?: {
    fecha?: string;
    codigo?: string;
    nombre?: string;
    tipoPeso?: string;
    pesoKg?: number;
  }
): Observable<PagedResponse<Triaje>> {
  let params: any = { pagina, tamano };
  if (filters?.fecha) params['fecha'] = filters.fecha;
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
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      body: payload,
    });
  }
  getTiposPeso(): Observable<TriajeTipoPesoOption[]> {
    return this.http.get<TriajeTipoPesoOption[]>(`${this.apiUrl}/tipos-peso`);
  }
  getVacunos(): Observable<TriajeVacunoOption[]> {
    return this.http.get<TriajeVacunoOption[]>(`${this.apiUrl}/vacunos`);
  }

  getHistorialByVacunoId(vacunoId: number): Observable<TriajeHistorialItem[]> {
    return this.http.get<TriajeHistorialItem[]>(`${this.apiUrl}/historial/${vacunoId}`);
  }

  getGeneralReport(fechaInicio?: string, fechaFin?: string): Observable<Triaje[]> {
    let params: any = {};
    if (fechaInicio) params['fechaInicio'] = fechaInicio;
    if (fechaFin) params['fechaFin'] = fechaFin;
    return this.http.get<Triaje[]>(`${this.apiUrl}/reporte/general`, { params });
  }
}
