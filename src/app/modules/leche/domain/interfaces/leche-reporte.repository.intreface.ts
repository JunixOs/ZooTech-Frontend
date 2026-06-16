import { Observable } from 'rxjs';

export abstract class LecheReporteRepository {
  abstract getReporteLeche(): Observable<Blob>;
}
