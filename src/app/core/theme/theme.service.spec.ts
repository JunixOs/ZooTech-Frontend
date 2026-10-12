import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TenantService } from '@core/tenant/tenant.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as appContext from '@core/auth/app-context';
import { ThemeService } from './theme.service';

vi.mock('@core/auth/app-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@core/auth/app-context')>();

  return {
    ...actual,
    getCurrentHostname: vi.fn(),
  };
});

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(appContext.getCurrentHostname)
      .mockReset()
      .mockReturnValue(appContext.ADMIN_HOSTNAME);
    document.documentElement.removeAttribute('data-app');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('uses the hostname to initialize the admin app variant before tenant headers arrive', () => {
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: TenantService, useValue: { getCurrentApp: () => null } },
      ],
    });

    const service = TestBed.inject(ThemeService);
    const doc = TestBed.inject(DOCUMENT);

    expect(service.currentApp()).toBe('admin');
    expect(doc.documentElement.dataset['app']).toBe('admin');
  });
});
