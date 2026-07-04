import { Observable } from 'rxjs';
import {
  TriajeRegistro,
  TriajeVacunoOption,
  RegistrarTriajeRequest,
} from '@modules/sanidad/domain/models/triaje.model';

export abstract class TriajeRepository {
  abstract getAll(): Observable<TriajeRegistro[]>;
  abstract getById(id: string): Observable<TriajeRegistro>;
  abstract create(data: RegistrarTriajeRequest): Observable<void>;
  abstract deleteById(id: string, motivo: string): Observable<void>;
  abstract updateById(id: string, data: Partial<TriajeRegistro>): Observable<void>;
  abstract getVacunos(): Observable<TriajeVacunoOption[]>;
}
