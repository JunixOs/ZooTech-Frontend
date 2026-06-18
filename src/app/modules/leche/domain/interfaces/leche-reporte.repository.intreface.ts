import { Observable } from 'rxjs';
import { ReporteOrdeniosPdfFiltros } from '../models/leche.model';

export abstract class LecheReporteRepository {
  abstract getReporteLeche(filtros?: ReporteOrdeniosPdfFiltros): Observable<Blob>;
}
