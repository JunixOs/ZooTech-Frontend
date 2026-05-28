import { Observable } from 'rxjs';
import { LecheRegistro, VacunoSimpleDTO } from '@modules/leche/domain/models/leche.model';

export abstract class LecheRepository {
  abstract getAll(): Observable<LecheRegistro[]>;
  abstract getById(id: string): Observable<LecheRegistro>;
  abstract deleteById(id: string, motivo: string): Observable<void>;
  abstract updateById(id: string, data: Partial<LecheRegistro>): Observable<void>;
  abstract save(data: any): Observable<void>;
  abstract getVacunos(): Observable<VacunoSimpleDTO[]>;
}
