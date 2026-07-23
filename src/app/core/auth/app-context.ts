import { AppContext } from '@modules/auth/domain/auth.model';
import { environment } from '@env/environment';

export const APP_BASE_DOMAIN = environment.appBaseDomain;
export const APP_LOCAL_BASE_DOMAIN = environment.localBaseDomain;
export const ADMIN_HOSTNAME = `${environment.adminSubdomain}.${APP_BASE_DOMAIN}`;
export const ADMIN_LOCAL_HOSTNAME = `${environment.adminSubdomain}.${APP_LOCAL_BASE_DOMAIN}`;

export function getAppContextFromHostname(hostname: string): AppContext {
  const normalizedHostname = hostname.toLowerCase().trim();

  if (
    normalizedHostname === `${environment.adminSubdomain}.localhost` ||
    normalizedHostname === ADMIN_HOSTNAME ||
    normalizedHostname === ADMIN_LOCAL_HOSTNAME
  ) {
    return 'admin';
  }

  if (normalizedHostname === 'localhost' || normalizedHostname === '127.0.0.1') {
    return 'tenant';
  }

  if (
    normalizedHostname.endsWith('.localhost') ||
    isTenantSubdomain(normalizedHostname, APP_BASE_DOMAIN) ||
    isTenantSubdomain(normalizedHostname, APP_LOCAL_BASE_DOMAIN)
  ) {
    return 'tenant';
  }

  return 'unknown';
}

function isTenantSubdomain(hostname: string, baseDomain: string): boolean {
  return hostname.endsWith(`.${baseDomain}`) && hostname !== baseDomain;
}

export function getCurrentHostname(): string {
  return window.location.hostname;
}
