import { Observable } from 'rxjs';
import { LecheRegistro } from '@modules/leche/domain/models/leche.model';

export abstract class LecheRepository {
  abstract getAll(): Observable<LecheRegistro[]>;
  abstract getById(id: string): Observable<LecheRegistro>;
}
