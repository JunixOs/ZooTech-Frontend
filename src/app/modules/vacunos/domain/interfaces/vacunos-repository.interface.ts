import { Observable } from 'rxjs';
import { PaginatedResult } from '@shared/models/pagination.model';
import {
  GranjaOption,
  RegistrarVacunoRequest,
  RegistrarVacunoResponse,
  Vacuno,
  VacunoActivityStatsDto,
  VacunoGenealogiaDto,
  VacunoReferenceOption,
  VacunosQueryParams,
} from '../models/vacuno.model';

export interface VacunoRepository {
  getAll(params?: VacunosQueryParams): Observable<PaginatedResult<Vacuno>>;
  getById(id: string | number): Observable<Vacuno>;
  create(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse>;
  updateById(id: string | number, data: RegistrarVacunoRequest): Observable<Vacuno>;
  deleteById(id: string | number, motivoEliminacion: string): Observable<void>;
  getGranjas(): Observable<GranjaOption[]>;
  getActivityStats(fechaInicio: string, fechaFin: string): Observable<VacunoActivityStatsDto>;
  exportarActividad(
    formato: 'excel' | 'pdf',
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<Blob>;
  getGenealogia(codigoOId: string | number, niveles: number): Observable<VacunoGenealogiaDto>;
  exportarArbolGenealogico(
    id: number,
    formato: 'excel' | 'pdf',
    niveles?: number,
  ): Observable<Blob>;
  getReferences(): Observable<VacunoReferenceOption[]>;
}
