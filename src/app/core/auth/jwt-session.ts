import { AuthRole, JwtSession } from '@modules/auth/domain/auth.model';

const ROLE_CLAIM = 'role';
const ASP_NET_ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const SUB_CLAIM = 'sub';
const ASP_NET_NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

interface JwtPayload {
  role?: unknown;
  exp?: unknown;
  sub?: unknown;
  [ASP_NET_ROLE_CLAIM]?: unknown;
  [ASP_NET_NAME_CLAIM]?: unknown;
}

export function parseJwtSession(token: string, hostname: string): JwtSession {
  const payload = decodeJwtPayload(token);
  const role = parseAuthRole(payload[ROLE_CLAIM] ?? payload[ASP_NET_ROLE_CLAIM]);
  const expiresAt = parseExpiration(payload.exp);
  const userId = parseUserId(payload[SUB_CLAIM]);
  const userName = parseUserName(payload[ASP_NET_NAME_CLAIM]);

  return {
    token,
    role,
    expiresAt,
    hostname,
    userId,
    userName,
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

function parseUserId(value: unknown): number {
  const userId = Number(value);

  if (typeof value !== 'string' || !Number.isFinite(userId)) {
    throw new Error('errorInvalidJwtUserId');
  }

  return userId;
}

function parseUserName(value: unknown): string {
  if (typeof value !== 'string' || !value) {
    throw new Error('errorInvalidJwtUserName');
  }

  return value;
}
