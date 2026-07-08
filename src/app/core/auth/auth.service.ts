<<<<<<< HEAD
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
=======
import { inject, Injectable, signal } from '@angular/core';
import { LocalStorage } from '@core/store/local.store';
import { JwtSession } from '@modules/auth/domain/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  userRole = signal<string | null>(null);
  userUrl = signal<string | null>(null);
  expiresAt = signal<Date | null>(null);
  userId = signal<number | null>(null);
  userName = signal<string | null>(null);

  private readonly storage = inject(LocalStorage);
  private readonly tokenStorageKey = 'access_token';
  private readonly sessionStorageKey = 'auth_session';

  constructor() {
    this.restoreSession();
  }

  saveSession(session: JwtSession): void {
    this.storage.setItem(this.tokenStorageKey, session.token);
    this.storage.setItem(this.sessionStorageKey, session);
    this.setSessionSignals(session);
  }

  getToken(): string | null {
    return this.storage.getItem(this.tokenStorageKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.storage.removeItem(this.tokenStorageKey);
    this.storage.removeItem(this.sessionStorageKey);
    this.isAuthenticated.set(false);
    this.userRole.set(null);
    this.expiresAt.set(null);
    this.userUrl.set(null);
    this.userId.set(null);
    this.userName.set(null);
  }

  private restoreSession(): void {
    const storedSession = this.storage.getItem(this.sessionStorageKey) as StoredJwtSession | null;

    if (!storedSession) {
      return;
    }

    const session: JwtSession = {
      token: storedSession.token,
      role: storedSession.role,
      hostname: storedSession.hostname,
      expiresAt: new Date(storedSession.expiresAt),
    };

    this.setSessionSignals(session);
  }

  private setSessionSignals(session: JwtSession): void {
    this.isAuthenticated.set(true);
    this.userRole.set(session.role);
    this.expiresAt.set(session.expiresAt);
    this.userUrl.set(session.hostname);
>>>>>>> origin/develop
  }
}

interface StoredJwtSession {
  token: string;
  role: JwtSession['role'];
  expiresAt: string;
  hostname: string;
}
