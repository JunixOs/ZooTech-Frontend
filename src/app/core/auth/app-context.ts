import { AppContext } from '@modules/auth/domain/auth.model';

export const APP_BASE_DOMAIN = 'zentrycorp.dev';
export const APP_LOCAL_BASE_DOMAIN = 'zentrycorp.local';
export const ADMIN_HOSTNAME = `admin.${APP_BASE_DOMAIN}`;
export const ADMIN_LOCAL_HOSTNAME = `admin.${APP_LOCAL_BASE_DOMAIN}`;

export function getAppContextFromHostname(hostname: string): AppContext {
  const normalizedHostname = hostname.toLowerCase().trim();

  if (
    normalizedHostname === 'admin.localhost' ||
    normalizedHostname === ADMIN_HOSTNAME ||
    normalizedHostname === ADMIN_LOCAL_HOSTNAME
  ) {
    return 'admin';
  }

  if (normalizedHostname === 'localhost') {
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
