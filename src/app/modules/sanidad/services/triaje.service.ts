import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment.development';
import { Triaje, RegistrarTriajePayload, TriajeTipoPesoOption, TriajeVacunoOption, TriajeHistorialItem } from '../triaje/domain/models/triaje.model';

@Injectable({
  providedIn: 'root',
})
export class TriajeService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/triaje`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Triaje[]> {
    return this.http.get<Triaje[]>(this.apiUrl);
  }

  getById(id: number): Observable<Triaje> {
    return this.http.get<Triaje>(`${this.apiUrl}/${id}`);
  }

  update(id: number, payload: RegistrarTriajePayload): Observable<Triaje> {
    return this.http.put<Triaje>(`${this.apiUrl}/${id}`, payload);
  }


  getTiposPeso(): Observable<TriajeTipoPesoOption[]> {
  return this.http.get<TriajeTipoPesoOption[]>(`${this.apiUrl}/tipos-peso`);
}
getVacunos(): Observable<TriajeVacunoOption[]> {
  return this.http.get<TriajeVacunoOption[]>(`${this.apiUrl}/vacunos`);
}

getHistorialByVacunoId(vacunoId: number): Observable<TriajeHistorialItem[]> {
  return this.http.get<TriajeHistorialItem[]>(`${this.apiUrl}/historial/${vacunoId}`);
}
}
