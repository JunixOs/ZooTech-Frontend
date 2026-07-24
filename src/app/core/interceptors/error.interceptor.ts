import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AppHttpError } from '@core/errors/app-http-error';

function extractBackendMessage(errorBody: unknown): string | null {
  if (!errorBody) return null;

  if (typeof errorBody === 'string') {
    const trimmed = errorBody.trim();
    if (!trimmed) return null;

    try {
      const parsed = JSON.parse(trimmed);
      return extractBackendMessage(parsed);
    } catch {
      return trimmed;
    }
  }

  if (typeof errorBody === 'object') {
    const body = errorBody as Record<string, unknown>;

    if (Array.isArray(body['message'])) {
      return body['message'].filter((msg) => typeof msg === 'string').join(', ');
    }
    if (typeof body['message'] === 'string' && body['message'].trim()) {
      return body['message'].trim();
    }
    if (body['errorMessage'] && typeof body['errorMessage'] === 'string') {
      return (body['errorMessage'] as string).trim();
    }
    if (body['Error'] && typeof body['Error'] === 'object') {
      return extractBackendMessage(body['Error']);
    }
    if (body['Message'] && typeof body['Message'] === 'string') {
      return (body['Message'] as string).trim();
    }
    if (body['detail'] && typeof body['detail'] === 'string') {
      return (body['detail'] as string).trim();
    }
    if (body['errors'] && typeof body['errors'] === 'object') {
      const errObj = body['errors'] as Record<string, unknown>;
      const messages: string[] = [];
      for (const val of Object.values(errObj)) {
        if (Array.isArray(val)) {
          messages.push(...val.filter((v) => typeof v === 'string'));
        } else if (typeof val === 'string') {
          messages.push(val);
        }
      }
      if (messages.length > 0) return messages.join(', ');
    }
  }

  return null;
}

function extractBackendErrorCode(errorBody: unknown): string | null {
  if (!errorBody) return null;

  if (typeof errorBody === 'string') {
    try {
      const parsed = JSON.parse(errorBody.trim());
      return extractBackendErrorCode(parsed);
    } catch {
      return null;
    }
  }

  if (typeof errorBody === 'object') {
    const body = errorBody as Record<string, unknown>;
    if (body['ErrorCode'] && typeof body['ErrorCode'] === 'string') {
      return body['ErrorCode'] as string;
    }
    if (body['Error'] && typeof body['Error'] === 'object') {
      return extractBackendErrorCode(body['Error']);
    }
  }

  return null;
}

/**
 * Interceptor global de errores HTTP.
 *
 * Captura cualquier error en las peticiones salientes, extrae un mensaje
 * legible (priorizando el `errorMessage` que venga del backend) y lo relanza
 * como un `AppHttpError` con código de error para que cada servicio/componente
 * pueda traducirlo via i18n.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => {
      let message = 'Error inesperado. Intente nuevamente.';
      let errorCode: string | null = null;
      let status = 0;

      if (err instanceof HttpErrorResponse) {
        status = err.status;
        message =
          extractBackendMessage(err.error) ??
          `Error del servidor (${err.status})`;
        errorCode = extractBackendErrorCode(err.error);

        switch (err.status) {
          case 0:
            message = 'No se pudo conectar con el servidor. Verifique su conexión.';
            errorCode = 'NETWORK_ERROR';
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      console.error('[HTTP Error]', message, err);
      return throwError(() => new AppHttpError(message, status, errorCode));
    }),
  );
