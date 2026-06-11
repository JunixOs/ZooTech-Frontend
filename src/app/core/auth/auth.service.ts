import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { TenantService } from '@core/tenant/tenant.service';

export interface LoginResponse {
  token: string;
  tenantId: string;
  userId: number;
  userName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tenant = inject(TenantService);

  isAuthenticated = signal(!!localStorage.getItem('auth_token'));
  userId = signal<number | null>(this.loadNumber('user_id'));
  userName = signal<string | null>(localStorage.getItem('user_name'));

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('tenant_id', res.tenantId);
          localStorage.setItem('user_id', String(res.userId));
          localStorage.setItem('user_name', res.userName);
          this.tenant.setTenant(res.tenantId);
          this.isAuthenticated.set(true);
          this.userId.set(res.userId);
          this.userName.set(res.userName);
        }),
      );
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    this.isAuthenticated.set(false);
    this.userId.set(null);
    this.userName.set(null);
    this.router.navigate(['/login']);
  }

  private loadNumber(key: string): number | null {
    const val = localStorage.getItem(key);
    return val ? Number(val) : null;
  }
}
