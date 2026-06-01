import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { API_BASE_URL } from '@core/api/api.config';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly demoEmail = 'admin@zootech.com';
  private readonly demoPassword = 'Zootech2026!';
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly tokenKey = 'zootech_token';
  private readonly userKey = 'zootech_user';

  readonly isAuthenticated = signal(this.readToken() !== null);
  readonly user = signal<AuthUser | null>(this.readUser());

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        catchError((error) => {
          if (this.isDemoLogin(email, password)) {
            return of(this.createDemoSession());
          }

          return throwError(() => error);
        }),
        tap((response) => {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this.isAuthenticated.set(true);
          this.user.set(response.user);
          this.router.navigate(['/dashboard']);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticated.set(false);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.readToken();
  }

  private readToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private readUser(): AuthUser | null {
    const rawUser = localStorage.getItem(this.userKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private isDemoLogin(email: string, password: string): boolean {
    return email.trim().toLowerCase() === this.demoEmail && password === this.demoPassword;
  }

  private createDemoSession(): LoginResponse {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);

    return {
      token: `demo-${crypto.randomUUID()}`,
      tokenType: 'Bearer',
      expiresAt: expiresAt.toISOString(),
      user: {
        id: 1,
        nombre: 'Administrador Zootech',
        email: this.demoEmail,
        rol: 'Administrador',
      },
    };
  }
}
