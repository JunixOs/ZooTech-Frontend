import { AppContext } from '@modules/auth/domain/auth.model';

export const APP_BASE_DOMAIN = 'zentrycorp.local';
export const ADMIN_HOSTNAME = `admin.${APP_BASE_DOMAIN}`;

export function getAppContextFromHostname(hostname: string): AppContext {
  const normalizedHostname = hostname.toLowerCase().trim();

  // Soporte para subdominios .localhost (ej: admin.localhost, zootecniaunas.localhost)
  if (normalizedHostname === 'admin.localhost') {
    return 'admin';
  }
  if (normalizedHostname.endsWith('.localhost') && normalizedHostname !== 'localhost') {
    return 'tenant';
  }

  // Soporte para subdominios admin (tanto local como dev de producción/tests)
  if (normalizedHostname === 'admin.zentrycorp.local' || normalizedHostname === 'admin.zentrycorp.dev') {
    return 'admin';
  }

  // Soporte para subdominios tenant (.zentrycorp.local y .zentrycorp.dev)
  if (
    (normalizedHostname.endsWith('.zentrycorp.local') && normalizedHostname !== 'zentrycorp.local') ||
    (normalizedHostname.endsWith('.zentrycorp.dev') && normalizedHostname !== 'zentrycorp.dev')
  ) {
    return 'tenant';
  }

  // Fallback para localhost y 127.0.0.1 directamente
  if (normalizedHostname === 'localhost' || normalizedHostname === '127.0.0.1') {
    return 'tenant';
  }

  return 'unknown';
}

export function getCurrentHostname(): string {
  return window.location.hostname;
}
