import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { PaginatedResult } from '@shared/models/pagination.model';
import { Vacuno } from '../domain/models/vacuno.model';
import { VacunoListResponseDto } from './dtos/vacuno-list-response.dto';
import { VacunoMapper } from './vacunos.mapper';

export interface VacunosQueryParams {
  page?: number;
  limit?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'vivo' | 'muerto';
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class VacunosApiService {
  private http = inject(HttpClient);
  // Apuntando al backend local en el puerto 5000
  private baseUrl = 'http://localhost:5000';

  listarVacunos(params: VacunosQueryParams = {}): Observable<PaginatedResult<Vacuno>> {
    return this.http
      .get<VacunoListResponseDto>(`${this.baseUrl}/v1/vacunos`, { params: { ...params } })
      .pipe(
        map((response) => ({
          items: response.data.map(VacunoMapper.toDomain),
          totalItems: response.pagination.total,
          paginaActual: response.pagination.page,
          totalPaginas: response.pagination.totalPages,
          limitePorPagina: response.pagination.limit,
        }))
      );
  }
}
