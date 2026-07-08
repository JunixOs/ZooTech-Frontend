import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@core/api/api.config';
import { catchError, Observable, throwError } from 'rxjs';
import {
  CreateTenantRequest,
  CreateTenantResponse,
  CreateUserInTenantRequest,
  CreateUserInTenantResponse,
} from '../domain/tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantApiService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_BASE_URL);

  createTenant(request: CreateTenantRequest): Observable<CreateTenantResponse> {
    return this.http.post<CreateTenantResponse>(`${this.apiUrl}/tenancing`, request).pipe(
      catchError((err) => {
        console.error('[TenantApiService] Error al crear tenant.');
        return throwError(() => err);
      }),
    );
  }

  createUserInTenant(request: CreateUserInTenantRequest): Observable<CreateUserInTenantResponse> {
    return this.http
      .post<CreateUserInTenantResponse>(`${this.apiUrl}/tenancing/create-tenant-user`, request)
      .pipe(
        catchError((err) => {
          console.error('[TenantApiService] Error al crear usuario en tenant.');
          return throwError(() => err);
        }),
      );
  }
}
