import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CeloRegistro, RegistrarCeloRequest } from '../domain/models/celo.model';
import { ApiResponse } from '@shared/models/api-response.model';

export interface VacaCelo {
  id: number;
  codigo: string;
  nombre: string;
  diasRestante: number;
  estado: 'En celo' | 'Próximo' | 'Pasó';
  vecesEnCelo: number;
  crias: number;
}

@Injectable({
  providedIn: 'root',
})
export class CeloApiService {
  private readonly baseUrl = `${environment.apiUrl}/celo`;

  constructor(private http: HttpClient) { }

  listarCelos(): Observable<CeloRegistro[]> {
    return this.http.get<ApiResponse<CeloRegistro[]>>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  listarVacasEnCelo(fechaInicio?: string, fechaFin?: string): Observable<VacaCelo[]> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http
      .get<ApiResponse<VacaCelo[]>>(`${this.baseUrl}/vacas-en-celo`, { params })
      .pipe(map(response => response.data));
  }

  registrarCelo(data: RegistrarCeloRequest) {
    return this.http.post(`${this.baseUrl}/registrar`, data);
  }
}
