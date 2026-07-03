import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { LecheReporteRepository } from '@modules/leche/domain/interfaces/leche-reporte.repository.interface';
import { ReporteOrdeniosPdfFiltros } from '@modules/leche/domain/models/leche.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ReporteLecheService implements LecheReporteRepository {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/produccion-leche`;

  getReporteLeche(filtros?: ReporteOrdeniosPdfFiltros): Observable<Blob> {
    let params = new HttpParams();

    if (filtros?.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros?.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros?.vacunoId) params = params.set('vacunoId', filtros.vacunoId);
    if (filtros?.estadoOrdenioCode) params = params.set('estadoOrdenioCode', filtros.estadoOrdenioCode);
    if (filtros?.comparativo !== undefined) params = params.set('comparativo', String(filtros.comparativo));

    return this.http.get(`${this.apiUrl}/reporte/pdf`, {
      params,
      responseType: 'blob',
    });
  }
}
