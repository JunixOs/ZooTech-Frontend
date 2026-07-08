import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getAppContextFromHostname, getCurrentHostname } from '@core/auth/app-context';
import { AuthService } from '@core/auth/auth.service';
import { parseJwtSession } from '@core/auth/jwt-session';
import { AuthApiService } from '../infrastructure/auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private readonly api = inject(AuthApiService);
  private readonly coreAuthService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  inicioSesionUsuario(correo: string, password: string): void {
    const hostname = getCurrentHostname();
    this.isLoading.set(true);
    this.error.set(null);

    this.api.login(correo, password, hostname).subscribe({
      next: (token) => {
        const session = parseJwtSession(token, hostname);
        this.coreAuthService.saveSession(session);
        this.isLoading.set(false);
        this.router.navigateByUrl(this.getRedirectUrl(hostname));
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  private getRedirectUrl(hostname: string): string {
    return getAppContextFromHostname(hostname) === 'admin' ? '/admin' : '/dashboard';
  }
}
