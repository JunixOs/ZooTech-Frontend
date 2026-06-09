import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import {
  LecheRegistro,
  LecheVacunoOption,
  OrdenioDTO,
  RegistrarLecheRequest,
} from '@modules/leche/domain/models/leche.model';
import { LecheMapper } from '@modules/leche/applications/mappers/leche.mapper';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class LecheService implements LecheRepository {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/produccion-leche`;

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

  create(data: RegistrarLecheRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, data);
  }

  deleteById(id: string, motivo: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      body: {
        motivoEliminacion: motivo,
      },
    });
  }

  updateById(id: string, data: Partial<LecheRegistro>): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}`, data);
  }

  getVacunos(): Observable<LecheVacunoOption[]> {
    return this.http.get<LecheVacunoOption[]>(`${this.apiUrl}/vacunos`);
  }
}
