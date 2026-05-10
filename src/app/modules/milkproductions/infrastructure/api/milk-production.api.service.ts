import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MilkProduction } from '../../domain/entities/milk-production.entity';

@Injectable({
  providedIn: 'root',
})
export class MilkProductionApiService {
  private http = inject(HttpClient);
  // URL base siguiendo el estándar definido en la guía de contratos
  private apiUrl = '/v1/produccion-leche';

  getAll(): Observable<MilkProduction[]> {
    return this.http.get<MilkProduction[]>(this.apiUrl);
  }

  getById(id: number): Observable<MilkProduction> {
    return this.http.get<MilkProduction>(`${this.apiUrl}/${id}`);
  }

  create(data: MilkProduction): Observable<MilkProduction> {
    return this.http.post<MilkProduction>(this.apiUrl, data);
  }

  update(id: number, data: Partial<MilkProduction>): Observable<MilkProduction> {
    return this.http.patch<MilkProduction>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
