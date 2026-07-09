import { AppContext } from '@modules/auth/domain/auth.model';

export const APP_BASE_DOMAIN = 'zentrycorp.dev';
export const ADMIN_HOSTNAME = `admin.${APP_BASE_DOMAIN}`;

export const APP_BASE_DOMAIN_LOCAL = 'zentrycorp.local';
export const ADMIN_HOSTNAME_LOCAL = `admin.${APP_BASE_DOMAIN_LOCAL}`;

export function getAppContextFromHostname(hostname: string): AppContext {
  const normalizedHostname = hostname.toLowerCase().trim();

  if (normalizedHostname === ADMIN_HOSTNAME || normalizedHostname === ADMIN_HOSTNAME_LOCAL) {
    return 'admin';
  }

  if (
    (normalizedHostname.endsWith(`.${APP_BASE_DOMAIN}`) && normalizedHostname !== APP_BASE_DOMAIN) ||
    (normalizedHostname.endsWith(`.${APP_BASE_DOMAIN_LOCAL}`) && normalizedHostname !== APP_BASE_DOMAIN_LOCAL)
  ) {
    return 'tenant';
  }

  if (normalizedHostname === 'localhost') {
    return 'tenant';
  }

  return 'unknown';
}

export function getCurrentHostname(): string {
  return window.location.hostname;
}
