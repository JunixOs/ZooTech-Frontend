import { describe, expect, it } from 'vitest';
import { getAppContextFromHostname } from './app-context';

describe('getAppContextFromHostname', () => {
  it('detects the admin subdomain', () => {
    expect(getAppContextFromHostname('admin.zentrycorp.dev')).toBe('admin');
  });

  it('detects tenant subdomains', () => {
    expect(getAppContextFromHostname('ganaderia.zentrycorp.dev')).toBe('tenant');
  });

  it('returns unknown for the apex domain', () => {
    expect(getAppContextFromHostname('zentrycorp.dev')).toBe('unknown');
  });
});
