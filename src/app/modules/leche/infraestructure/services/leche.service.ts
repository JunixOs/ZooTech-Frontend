import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheRegistro, OrdenioDTO } from '@modules/leche/domain/models/leche.model';
import { LecheMapper } from '@modules/leche/applications/mappers/leche.mapper';

@Injectable({
  providedIn: 'root',
})
export class LecheService implements LecheRepository {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/v1/produccion-leche';

  getAll(): Observable<LecheRegistro[]> {
    return this.http
      .get<{ data: OrdenioDTO[] }>(this.apiUrl)
      .pipe(map((response) => LecheMapper.toDomainList(response.data)));
  }

  getById(id: string): Observable<LecheRegistro> {
    return this.http
      .get<{ data: OrdenioDTO }>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => LecheMapper.toDomain(response.data)));
  }

  deleteById(id: string, motivo: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      body: {
        motivoEliminacion: motivo,
      },
    });
  }

  updateById(id: string, data: Partial<LecheRegistro>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  downloadExcel(filtros?: ConsultaFiltros): Observable<Blob> {
    const params = this.buildFiltrosParams(filtros);
    return this.http.get(`${this.apiUrl}/reporte/excel`, {
      params,
      responseType: 'blob'
    });
  }

  downloadPdf(filtros?: ConsultaFiltros): Observable<Blob> {
    const params = this.buildFiltrosParams(filtros);
    return this.http.get(`${this.apiUrl}/reporte/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  private buildFiltrosParams(filtros?: ConsultaFiltros): HttpParams {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
      if (filtros.vacunoId) params = params.set('vacunoId', filtros.vacunoId);
      if (filtros.page !== undefined) params = params.set('page', filtros.page.toString());
      if (filtros.pageSize !== undefined) params = params.set('pageSize', filtros.pageSize.toString());
    }
    return params;
  }

}
