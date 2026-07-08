import { inject, Injectable, signal } from '@angular/core';
import { LocalStorage } from '@core/store/local.store';
import { JwtSession } from '@modules/auth/domain/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  userRole = signal<string | null>(null);
  userUrl = signal<string | null>(null);
  expiresAt = signal<Date | null>(null);

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
  }
}

interface StoredJwtSession {
  token: string;
  role: JwtSession['role'];
  expiresAt: string;
  hostname: string;
}
