import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CeloRegistro } from '../domain/models/celo.model';
import { ApiResponse } from '@shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CeloApiService {
  private readonly baseUrl = `${environment.apiUrl}/celo`;

  constructor(private http: HttpClient) {}

  listarCelos(): Observable<CeloRegistro[]> {
    return this.http.get<ApiResponse<CeloRegistro[]>>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }
}
