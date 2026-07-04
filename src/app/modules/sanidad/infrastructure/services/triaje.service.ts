import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ActualizarTriajePayload,
  EliminarTriajePayload,
  RegistrarTriajePayload,
  TriajeDTO,
  TriajeRegistro,
  TriajeHistorialItem,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
} from '@modules/sanidad/domain/models/triaje.model';
import { TriajeRepository, TriajeQueryFilters } from '@modules/sanidad/domain/interfaces/triaje-repository.interface';
import { TriajeMapper } from '@modules/sanidad/applications/mappers/triaje.mapper';
import { PaginatedResult } from '@shared/models/pagination.model';
type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };

@Injectable({ providedIn: 'root' })
export class TriajeService implements TriajeRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/triaje`;

  create(payload: RegistrarTriajePayload): Observable<TriajeRegistro> {
    return this.http
      .post<ApiResponse<TriajeDTO>>(this.apiUrl, payload)
      .pipe(map((r) => TriajeMapper.toDomain(r.data)));
  }

  getAll(
    pagina = 1,
    tamano = 10,
    filters?: TriajeQueryFilters,
  ): Observable<PaginatedResult<TriajeRegistro>> {
    const params: Record<string, string | number> = { pagina, tamano };
    if (filters?.fecha) params['fecha'] = filters.fecha;
    if (filters?.codigo) params['codigo'] = filters.codigo;
    if (filters?.nombre) params['nombre'] = filters.nombre;
    if (filters?.tipoPeso) params['tipoPeso'] = filters.tipoPeso;
    if (filters?.pesoKg) params['pesoKg'] = filters.pesoKg;
    if (filters?.vacunoId) params['vacunoId'] = filters.vacunoId;

    return this.http.get<ApiResponse<PaginatedResult<TriajeDTO>>>(this.apiUrl, { params }).pipe(
      map((r) => ({
        items: TriajeMapper.toDomainList(r.data.items),
        totalItems: r.data.totalItems,
        totalPaginas: r.data.totalPaginas,
        paginaActual: r.data.paginaActual,
        limitePorPagina: r.data.limitePorPagina,
      })),
    );
  }
  getById(id: number): Observable<TriajeRegistro> {
    return this.http
      .get<ApiResponse<TriajeDTO>>(`${this.apiUrl}/${id}`)
      .pipe(map((r) => TriajeMapper.toDomain(r.data)));
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

  getHistorialByVacunoId(
    vacunoId: number,
    desde?: string,
    hasta?: string,
  ): Observable<TriajeHistorialItem[]> {
    const params: Record<string, string> = {};
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;
    return this.http
      .get<ApiResponse<TriajeHistorialItem[]>>(`${this.apiUrl}/historial/${vacunoId}`, { params })
      .pipe(map((r) => r.data));
  }

  getHistorialGeneral(
    desde?: string,
    hasta?: string,
  ): Observable<TriajeHistorialItem[]> {
    const params: Record<string, string> = {};
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;
    return this.http
      .get<ApiResponse<TriajeHistorialItem[]>>(`${this.apiUrl}/historial-general`, { params })
      .pipe(map((r) => r.data));
  }

  downloadReporte(
    formato: 'excel' | 'pdf',
    vacunoId?: number,
    desde?: string,
    hasta?: string,
  ): Observable<Blob> {
    const params: Record<string, string> = { formato };
    if (vacunoId) params['vacunoId'] = vacunoId.toString();
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;

    return this.http.get(`${this.apiUrl}/descargar`, {
      params,
      responseType: 'blob',
    });
  }
  
}