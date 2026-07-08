import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/api/api.config';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.zentrycorp.dev/api/v1' },
      ],
    });

    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('uses the admin login endpoint on admin domains', () => {
    service.login('admin@mail.com', 'secret', 'admin.zentrycorp.dev').subscribe((token) => {
      expect(token).toBe('admin-token');
    });

    const req = httpMock.expectOne('https://api.zentrycorp.dev/api/v1/auth/admin/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@mail.com', password: 'secret' });
    req.flush('admin-token');
  });

  it('uses the tenant login endpoint on tenant domains without password payload', () => {
    service.login('user@mail.com', 'ignored', 'tenant.zentrycorp.dev').subscribe((token) => {
      expect(token).toBe('tenant-token');
    });

    const req = httpMock.expectOne('https://api.zentrycorp.dev/api/v1/auth/user/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'user@mail.com' });
    req.flush('tenant-token');
  });
});
