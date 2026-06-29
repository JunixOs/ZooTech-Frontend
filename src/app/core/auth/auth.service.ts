import { inject, Injectable, signal } from '@angular/core';
import { LocalStorage } from '@core/store/local.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  userRole = signal<string | null>(null);
  userUrl = signal<string | null>(null);
  expiresAt = signal<Date | null>(new Date());

  private readonly storage = inject(LocalStorage);

  saveToken(token: string, userRole: string, tokenTtl: string, userUrl: string): void {
      this.storage.setItem('access_token' , token);
      this.isAuthenticated.set(true);
      this.userRole.set(userRole);
      this.expiresAt.set(calculateExpirationDate(tokenTtl));
      this.userUrl.set(userUrl);
  }

  getToken(): string | null {
    return this.storage.getItem('access_token');
  }

  hasToken(): boolean {
    return !!this.storage.getItem('access_token');
  }

  logout(): void {
    this.storage.removeItem('access_token');
    this.isAuthenticated.set(false);
    this.userRole.set(null);
    this.expiresAt.set(new Date());
    this.userUrl.set(null);
  }
}
