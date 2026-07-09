import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TenantService } from '@core/tenant/tenant.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as appContext from '@core/auth/app-context';
import { ThemeService } from './theme.service';

vi.mock('@core/auth/app-context', () => ({
  getCurrentHostname: vi.fn(),
  getAppContextFromHostname: vi.fn((hostname: string) => {
    if (hostname === 'admin.zentrycorp.dev') return 'admin';
    if (hostname.endsWith('.zentrycorp.dev')) return 'tenant';
    return 'unknown';
  }),
}));

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(appContext.getCurrentHostname).mockReturnValue('admin.zentrycorp.dev');
    document.documentElement.removeAttribute('data-app');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('uses the hostname to initialize the admin app variant before tenant headers arrive', () => {
    TestBed.configureTestingModule({
      providers: [ThemeService, TenantService],
    });

    const service = TestBed.inject(ThemeService);
    const doc = TestBed.inject(DOCUMENT);

    expect(service.currentApp()).toBe('admin');
    expect(doc.documentElement.dataset['app']).toBe('admin');
  });
});
