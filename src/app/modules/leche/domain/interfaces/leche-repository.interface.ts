import { Observable } from 'rxjs';
import {
  ConsultaFiltros,
  LecheRegistro,
  LecheVacunoOption,
  RegistrarLecheRequest,
} from '@modules/leche/domain/models/leche.model';

export abstract class LecheRepository {
  abstract getAll(filtros?: ConsultaFiltros): Observable<LecheRegistro[]>;
  abstract getById(id: string): Observable<LecheRegistro>;
  abstract create(data: RegistrarLecheRequest): Observable<void>;
  abstract deleteById(id: string, motivo: string): Observable<void>;
  abstract updateById(id: string, data: Partial<LecheRegistro>): Observable<void>;
  abstract save(data: any): Observable<void>;
  abstract getVacunos(): Observable<LecheVacunoOption[]>;
}

export type { ConsultaFiltros };
