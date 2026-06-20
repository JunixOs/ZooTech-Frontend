import { InjectionToken } from '@angular/core';
import { environment } from '@env/environment';

/**
 * Token de inyección para la URL base de la API.
 * Usa `environment.apiUrl` en vez de hardcodear el valor.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => `${environment.apiUrl}/api/v1`,
});
