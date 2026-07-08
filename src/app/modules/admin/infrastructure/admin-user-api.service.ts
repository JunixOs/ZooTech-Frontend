import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@core/api/api.config';
import { catchError, Observable, throwError } from 'rxjs';
import {
  AdminUser,
  CreateAdminUserRequest,
  CreateAdminUserResponse,
} from '../domain/admin-user.model';

@Injectable({ providedIn: 'root' })
export class AdminUserApiService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_BASE_URL);

  listAdminUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/admin-user/users`).pipe(
      catchError((err) => {
        console.error('[AdminUserApiService] Error al listar usuarios admin.');
        return throwError(() => err);
      }),
    );
  }

  createAdminUser(request: CreateAdminUserRequest): Observable<CreateAdminUserResponse> {
    return this.http.post<CreateAdminUserResponse>(`${this.apiUrl}/admin-user`, request).pipe(
      catchError((err) => {
        console.error('[AdminUserApiService] Error al crear usuario admin.');
        return throwError(() => err);
      }),
    );
  }

  deleteAdminUser(id: number): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/admin-user/delete`, { params: { id: id.toString() } }).pipe(
      catchError((err) => {
        console.error('[AdminUserApiService] Error al eliminar usuario admin.');
        return throwError(() => err);
      }),
    );
  }
}
