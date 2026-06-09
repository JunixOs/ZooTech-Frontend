import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ReporteLeche implements ReporteLeche {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:5000/api/v1/reporte-leche';

  getReporteLeche() {
    return this.http.get(this.apiUrl);
  }

  getReporteLechePdf(filtros: Partial<ReporteLeche>): Observable<Blob> {
    let params = new HttpParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(`${this.apiUrl}/pdf`, {
      params,
      responseType: 'blob',
    });
  }
}
