import { Observable } from 'rxjs';
import {
  ConsultaFiltros,
  LecheRegistro,
  LecheVacunoOption,
  RegistrarLecheRequest,
  UpdateLecheRequest,
} from '@modules/leche/domain/models/leche.model';
import { PaginatedResult } from '@shared/models/pagination.model';

export abstract class LecheRepository {
  abstract getAll(filtros?: ConsultaFiltros): Observable<PaginatedResult<LecheRegistro>>;
  abstract getById(id: string): Observable<LecheRegistro>;
  abstract create(data: RegistrarLecheRequest): Observable<void>;
  abstract deleteById(id: string, motivo: string): Observable<void>;
  abstract updateById(id: string, data: UpdateLecheRequest): Observable<void>;
  abstract getVacunos(): Observable<LecheVacunoOption[]>;
  abstract downloadExcel(filtros?: ConsultaFiltros): Observable<Blob>;
  abstract downloadPdf(filtros?: ConsultaFiltros): Observable<Blob>;
}

export type { ConsultaFiltros };
