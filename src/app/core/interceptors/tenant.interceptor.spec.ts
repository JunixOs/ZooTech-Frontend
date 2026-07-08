import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/api/api.config';
import { TenantService } from '@core/tenant/tenant.service';
import { describe, expect, it } from 'vitest';
import { of } from 'rxjs';
import { tenantInterceptor } from './tenant.interceptor';

describe('tenantInterceptor', () => {
  it('maps backend X-Tenant-Type Admin header to frontend admin app variant', () => {
    TestBed.configureTestingModule({
      providers: [
        TenantService,
        { provide: API_BASE_URL, useValue: 'https://api.zentrycorp.dev/api/v1' },
      ],
    });

    const tenantService = TestBed.inject(TenantService);
    const request = new Request('https://api.zentrycorp.dev/api/v1/tenancing/info');
    const response = new HttpResponse({
      headers: new HttpHeaders({
        'X-Tenant-Id': '1',
        'X-Tenant-Name': 'admin',
        'X-Tenant-Legal-Name': 'Zentry Corp',
        'X-Tenant-Type': 'Admin',
      }),
    });

    TestBed.runInInjectionContext(() => {
      tenantInterceptor(request as never, () => of(response)).subscribe();
    });

    expect(tenantService.getCurrentApp()).toBe('admin');
  });
});
