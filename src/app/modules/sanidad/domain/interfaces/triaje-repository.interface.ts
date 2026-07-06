import { Observable } from 'rxjs';
import {
  ActualizarTriajePayload,
  EliminarTriajePayload,
  RegistrarTriajePayload,
  TriajeHistorialItem,
  TriajeRegistro,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
  ConsultaFiltros,
} from '@modules/sanidad/domain/models/triaje.model';
import { PaginatedResult } from '@shared/models/pagination.model';

export abstract class TriajeRepository {
  abstract getAll(filtros?: ConsultaFiltros): Observable<PaginatedResult<TriajeRegistro>>;
  abstract getById(id: number): Observable<TriajeRegistro>;
  abstract create(data: RegistrarTriajePayload): Observable<TriajeRegistro>;
  abstract update(id: number, data: ActualizarTriajePayload): Observable<void>;
  abstract delete(id: number, data: EliminarTriajePayload): Observable<void>;
  abstract getTiposPeso(): Observable<TriajeTipoPesoOption[]>;
  abstract getVacunos(): Observable<TriajeVacunoOption[]>;
  abstract getHistorialByVacunoId(vacunoId: number): Observable<TriajeHistorialItem[]>;
  abstract downloadExcel(filtros?: ConsultaFiltros): Observable<Blob>;
  abstract downloadPdf(filtros?: ConsultaFiltros): Observable<Blob>;
}
