import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import {
  LecheRegistro,
  LecheVacunoOption,
  OrdenioDTO,
  RegistrarLecheRequest,
  ConsultaFiltros,
  UpdateLecheRequest,
} from '@modules/leche/domain/models/leche.model';
import { LecheMapper } from '@modules/leche/applications/mappers/leche.mapper';
import { environment } from '@env/environment';

type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };

@Injectable({ providedIn: 'root' })
export class LecheService implements LecheRepository {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/produccion-leche`;

  getAll(filtros?: ConsultaFiltros): Observable<LecheRegistro[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
      if (filtros.vacunoId) params = params.set('vacunoId', filtros.vacunoId);
      if (filtros.page !== undefined) params = params.set('page', filtros.page);
      if (filtros.pageSize !== undefined) params = params.set('pageSize', filtros.pageSize);
    }
    return this.http
      .get<{ data: OrdenioDTO[] }>(this.apiUrl)
      .pipe(map((r) => LecheMapper.toDomainList(r.data)));
  }

  getById(id: string): Observable<LecheRegistro> {
    return this.http
      .get<ApiResponse<OrdenioDTO>>(`${this.apiUrl}/${id}`)
      .pipe(map((r) => LecheMapper.toDomain(r.data)));
  }

  create(data: RegistrarLecheRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, data);
  }

  deleteById(id: string, motivo: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      body: { motivoEliminacion: motivo },
    });
  }

  updateById(id: string, data: UpdateLecheRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}`, data);
  }

  getVacunos(): Observable<LecheVacunoOption[]> {
    return this.http
      .get<ApiResponse<LecheVacunoOption[]>>(`${this.apiUrl}/vacunos`)
      .pipe(map((r) => r.data));
  }
}
