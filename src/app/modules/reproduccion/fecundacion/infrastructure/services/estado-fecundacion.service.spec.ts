import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/api/api.config';
import { AuthService } from '@core/auth/auth.service';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { domainInterceptor, TENANT_DOMAIN } from '@core/interceptors/domain.interceptor';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EstadoFecundacionApiService } from './estado-fecundacion.service';

describe('EstadoFecundacionApiService', () => {
  let service: EstadoFecundacionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EstadoFecundacionApiService,
        provideHttpClient(withInterceptors([domainInterceptor, authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:16000/api/v1' },
        { provide: TENANT_DOMAIN, useValue: 'losandes.zentrycorp.local' },
        {
          provide: AuthService,
          useValue: {
            getToken: () => 'tenant-token',
            logout: () => undefined,
          },
        },
      ],
    });

    service = TestBed.inject(EstadoFecundacionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('usa la ruta v1 y deja tenant y usuario a los interceptores', () => {
    service.actualizarEstado(6036, 'GESTANTE').subscribe();

    const request = httpMock.expectOne(
      'http://localhost:16000/api/v1/reproduccion/fecundacion/estado/6036',
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.headers.get('X-Tenant-Url')).toBe('losandes.zentrycorp.local');
    expect(request.request.headers.get('Authorization')).toBe('Bearer tenant-token');
    expect(request.request.headers.has('X-User-Id')).toBe(false);
    request.flush({
      data: {
        vacunoId: 1,
        fecundacionId: 6036,
        estadoActual: 'Gestante',
      },
    });
  });
});
