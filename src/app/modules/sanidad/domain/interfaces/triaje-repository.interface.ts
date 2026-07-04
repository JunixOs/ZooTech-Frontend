import { Observable } from 'rxjs';
import {
  ActualizarTriajePayload,
  EliminarTriajePayload,
  RegistrarTriajePayload,
  TriajeHistorialItem,
  TriajeRegistro,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
} from '@modules/sanidad/domain/models/triaje.model';
import {   PaginatedResult } from '@shared/models/pagination.model';
export interface TriajeQueryFilters {
  fecha?: string;
  codigo?: string;
  hora?: string;
  nombre?: string;
  tipoPeso?: string;
  pesoKg?: number;
  fechaInicio?: string;
  fechaFin?: string;
  vacunoId?: number;
}

export abstract class TriajeRepository {
  abstract getAll(
    pagina?: number,
    tamano?: number,
    filters?: TriajeQueryFilters,
  ): Observable<PaginatedResult<TriajeRegistro>>;
  abstract getById(id: number): Observable<TriajeRegistro>;
  abstract create(data: RegistrarTriajePayload): Observable<TriajeRegistro>;
  abstract update(id: number, data: ActualizarTriajePayload): Observable<void>;
  abstract delete(id: number, data: EliminarTriajePayload): Observable<void>;
  abstract getTiposPeso(): Observable<TriajeTipoPesoOption[]>;
  abstract getVacunos(): Observable<TriajeVacunoOption[]>;
  abstract getHistorialByVacunoId(vacunoId: number): Observable<TriajeHistorialItem[]>;
}
