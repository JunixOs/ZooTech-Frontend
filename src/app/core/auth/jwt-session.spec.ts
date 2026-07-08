import { describe, expect, it } from 'vitest';
import { parseJwtSession } from './jwt-session';

function createToken(payload: Record<string, unknown>): string {
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `header.${encodedPayload}.signature`;
}

describe('parseJwtSession', () => {
  it('extracts role, expiration and hostname from a valid JWT', () => {
    const token = createToken({
      role: 'Admin',
      exp: 1_893_456_000,
    });

    expect(parseJwtSession(token, 'admin.zentrycorp.dev')).toEqual({
      token,
      role: 'Admin',
      expiresAt: new Date(1_893_456_000 * 1000),
      hostname: 'admin.zentrycorp.dev',
    });
  });

  it('supports the Microsoft role claim emitted by ASP.NET JWTs', () => {
    const token = createToken({
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Regular',
      exp: 1_893_456_000,
    });

    expect(parseJwtSession(token, 'tenant.zentrycorp.dev').role).toBe('Regular');
  });

  it('rejects JWTs without a supported role', () => {
    const token = createToken({ role: 'Owner', exp: 1_893_456_000 });

    expect(() => parseJwtSession(token, 'admin.zentrycorp.dev')).toThrow('errorInvalidAuthRole');
  });
});
