import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { LecheReporteRepository } from '@modules/leche/domain/interfaces/leche-reporte.repository.intreface';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ReporteLecheService implements LecheReporteRepository {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/produccion-leche`;

  getReporteLeche(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reporte/pdf`, {
      responseType: 'blob',
    });
  }
}
