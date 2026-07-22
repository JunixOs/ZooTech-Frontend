import { Observable } from 'rxjs';
import { PaginatedResult } from '@shared/models/pagination.model';
import {
  GranjaOption,
  RegistrarVacunoRequest,
  RegistrarVacunoResponse,
  Vacuno,
  VacunoActivityStatsDto,
  VacunoGenealogiaDto,
  VacunoOptionsResponse,
  VacunoReferenceOption,
  VacunosQueryParams,
} from '../models/vacuno.model';

export interface VacunoRepository {
  getAll(params?: VacunosQueryParams): Observable<PaginatedResult<Vacuno>>;
  getById(id: string | number): Observable<Vacuno>;
  create(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse>;
  updateById(id: string | number, data: RegistrarVacunoRequest): Observable<Vacuno>;
  deleteById(id: string | number, motivoEliminacion: string): Observable<void>;
  getOptions(): Observable<VacunoOptionsResponse>;
  getGranjas(): Observable<GranjaOption[]>;
  getActivityStats(fechaInicio: string, fechaFin: string): Observable<VacunoActivityStatsDto>;
  getGenealogia(codigoOId: string | number, niveles: number): Observable<VacunoGenealogiaDto>;
  exportarArbolExcel(id: number, niveles?: number): Observable<Blob>;
  getCatalogos(): Observable<unknown>;
  getReferences(): Observable<VacunoReferenceOption[]>;
}
