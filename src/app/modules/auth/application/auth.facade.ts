import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getAppContextFromHostname, getCurrentHostname } from '@core/auth/app-context';
import { AuthService } from '@core/auth/auth.service';
import { parseJwtSession } from '@core/auth/jwt-session';
import { AppHttpError } from '@core/errors/app-http-error';
import { ERROR_I18N_MAP, ERROR_FALLBACK_KEYS } from '@core/errors/error-codes';
import { finalize } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthApiService } from '../infrastructure/auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private readonly api = inject(AuthApiService);
  private readonly coreAuthService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

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
      error: (err: AppHttpError | Error) => {
        this.error.set(this.resolveErrorMessage(err));
        this.isLoading.set(false);
      },
    });
  }

  logout(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api
      .logout()
      .pipe(
        finalize(() => {
          this.coreAuthService.logout();
          this.isLoading.set(false);
          this.router.navigateByUrl('/login');
        }),
      )
      .subscribe({
        error: () => undefined,
      });
  }

  private resolveErrorMessage(err: AppHttpError | Error): string {
    if (err instanceof AppHttpError) {
      const code = err.errorCode;

      if (code === 'NETWORK_ERROR') {
        return this.translate.instant(ERROR_FALLBACK_KEYS.network);
      }

      if (code && ERROR_I18N_MAP[code]) {
        const translated = this.translate.instant(ERROR_I18N_MAP[code]);
        if (translated !== ERROR_I18N_MAP[code]) {
          return translated;
        }
      }

      return err.message;
    }

    return err.message || this.translate.instant(ERROR_FALLBACK_KEYS.unexpected);
  }

  private getRedirectUrl(hostname: string): string {
    return getAppContextFromHostname(hostname) === 'admin' ? '/admin' : '/dashboard';
  }
}
