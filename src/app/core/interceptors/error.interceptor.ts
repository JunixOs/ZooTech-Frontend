import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor global de errores HTTP.
 *
 * Captura cualquier error en las peticiones salientes, extrae un mensaje
 * legible (priorizando el `errorMessage` que venga del backend) y lo relanza
 * como un `Error` estándar para que cada servicio/componente lo maneje.
 *
 * SRP: Una sola razón de cambio — cómo se manejan los errores HTTP en toda la app.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => {
      let message = 'Error inesperado. Intente nuevamente.';
      const router = inject(Router);

      if (err instanceof HttpErrorResponse) {
        // El backend respondió con un código de error
        message =
          err.error?.errorMessage ??
          (typeof err.error === 'string' ? err.error : null) ??
          `Error del servidor (${err.status})`;

        switch (err.status) {
          case 0:
            message = 'No se pudo conectar con el servidor. Verifique su conexión.';
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      console.error('[HTTP Error]', message, err);
      return throwError(() => new Error(message));
    }),
  );
