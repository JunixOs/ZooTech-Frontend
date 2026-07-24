import { Observable } from 'rxjs';
import {
  CreateFecundacionRequest,
  CreateFecundacionResponse,
  FecundacionEdit,
  FecundacionOptions,
  FecundacionUpdateResponse,
  FecundacionVacunoOption,
  UpdateFecundacionRequest,
} from '../models/fecundacion.model';
import { FecundacionesQueryParams } from '../../infrastructure/services/fecundacion.service';

export interface FecundacionRepository {
  listarFecundaciones(params?: FecundacionesQueryParams): Observable<any>;
  crear(payload: CreateFecundacionRequest): Observable<CreateFecundacionResponse>;
  obtenerParaEditar(id: number): Observable<FecundacionEdit>;
  obtenerOpciones(): Observable<FecundacionOptions>;
  buscarVacunos(
    sexo: 'hembra' | 'macho',
    q?: string,
    soloDisponibles?: boolean,
    excluirFecundacionId?: number | null
  ): Observable<FecundacionVacunoOption[]>;
  actualizar(id: number, payload: UpdateFecundacionRequest): Observable<FecundacionUpdateResponse>;
  eliminar(id: number, razon: string): Observable<void>;
}
