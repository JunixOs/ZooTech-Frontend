import { Observable } from 'rxjs';
import {
  LecheRegistro,
  LecheVacunoOption,
  RegistrarLecheRequest,
  VacasSequiaResponse
} from '@modules/leche/domain/models/leche.model';


export interface ConsultaFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  vacunoId?: string;
  page?: number;
  pageSize?: number;
}

export abstract class LecheRepository {
  abstract getAll(): Observable<LecheRegistro[]>;
  abstract getById(id: string): Observable<LecheRegistro>;
  abstract deleteById(id: string, motivo: string): Observable<void>;
  abstract updateById(id: string, data: Partial<LecheRegistro>): Observable<void>;
  abstract getVacunos(): Observable<LecheVacunoOption[]>;
  abstract getVacasEnSequia(filtros?: ConsultaFiltros): Observable<VacasSequiaResponse>;
}
