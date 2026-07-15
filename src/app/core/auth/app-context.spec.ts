import { describe, expect, it } from 'vitest';
import { getAppContextFromHostname } from './app-context';

describe('getAppContextFromHostname', () => {
  it('detects the admin subdomain', () => {
    expect(getAppContextFromHostname('admin.zentrycorp.dev')).toBe('admin');
  });

  it('detects the local admin subdomain', () => {
    expect(getAppContextFromHostname('admin.zentrycorp.local')).toBe('admin');
  });

  it('detects tenant subdomains', () => {
    expect(getAppContextFromHostname('ganaderia.zentrycorp.dev')).toBe('tenant');
  });

  it('detects local tenant subdomains', () => {
    expect(getAppContextFromHostname('zootecniaunas.zentrycorp.local')).toBe('tenant');
  });

  it('returns unknown for the apex domain', () => {
    expect(getAppContextFromHostname('zentrycorp.dev')).toBe('unknown');
  });

  it('returns unknown for the local apex domain', () => {
    expect(getAppContextFromHostname('zentrycorp.local')).toBe('unknown');
  });
});
