import { inject, Injectable, signal } from '@angular/core';
import { LocalStorage } from '@core/store/local.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  private readonly storage = inject(LocalStorage);

  saveToken(token: string): void {
      this.storage.setItem('access_token' , token);
      this.isAuthenticated.set(true);
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
  }
}
