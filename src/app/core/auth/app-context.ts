import { AppContext } from '@modules/auth/domain/auth.model';

export const APP_BASE_DOMAIN = 'zentrycorp.dev';
export const ADMIN_HOSTNAME = `admin.${APP_BASE_DOMAIN}`;

export function getAppContextFromHostname(hostname: string): AppContext {
  const normalizedHostname = hostname.toLowerCase().trim();

  if (normalizedHostname === ADMIN_HOSTNAME) {
    return 'admin';
  }

  if (
    normalizedHostname.endsWith(`.${APP_BASE_DOMAIN}`) &&
    normalizedHostname !== APP_BASE_DOMAIN
  ) {
    return 'tenant';
  }

  return 'unknown';
}

export function getCurrentHostname(): string {
  return window.location.hostname;
}
