import { AuthRole, JwtSession } from '@modules/auth/domain/auth.model';

const ROLE_CLAIM = 'role';
const ASP_NET_ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

interface JwtPayload {
  role?: unknown;
  exp?: unknown;
  [ASP_NET_ROLE_CLAIM]?: unknown;
}

export function parseJwtSession(token: string, hostname: string): JwtSession {
  const payload = decodeJwtPayload(token);
  const role = parseAuthRole(payload[ROLE_CLAIM] ?? payload[ASP_NET_ROLE_CLAIM]);
  const expiresAt = parseExpiration(payload.exp);

  return {
    token,
    role,
    expiresAt,
    hostname,
  };
}

function decodeJwtPayload(token: string): JwtPayload {
  const [, encodedPayload] = token.split('.');

  if (!encodedPayload) {
    throw new Error('errorInvalidJwt');
  }

  const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  try {
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    throw new Error('errorInvalidJwt');
  }
}

function parseAuthRole(value: unknown): AuthRole {
  if (value === 'Admin' || value === 'Regular') {
    return value;
  }

  throw new Error('errorInvalidAuthRole');
}

function parseExpiration(value: unknown): Date {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('errorInvalidJwtExpiration');
  }

  return new Date(value * 1000);
}
