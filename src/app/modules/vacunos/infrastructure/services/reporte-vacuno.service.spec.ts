import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/api/api.config';
import { domainInterceptor, TENANT_DOMAIN } from '@core/interceptors/domain.interceptor';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ReporteVacunoService } from './reporte-vacuno.service';

describe('ReporteVacunoService', () => {
  let service: ReporteVacunoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReporteVacunoService,
        provideHttpClient(withInterceptors([domainInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:16000/api/v1' },
      ],
    });

  });

  afterEach(() => httpMock?.verify());

  it.each([
    [
      'zootecniaunas.zentrycorp.local',
      '/api/v1/vacunos/reportes/descargas/listado_vacunos_tenant_4.xlsx',
    ],
    [
      'losandes.zentrycorp.local',
      '/api/v1/vacunos/reportes/descargas/listado_vacunos_tenant_5.pdf',
    ],
  ])('descarga mediante HttpClient para el tenant %s', (tenantDomain, downloadUrl) => {
    TestBed.overrideProvider(TENANT_DOMAIN, { useValue: tenantDomain });
    service = TestBed.inject(ReporteVacunoService);
    httpMock = TestBed.inject(HttpTestingController);
    const expectedFileName = downloadUrl.split('/').at(-1);

    service.descargarArchivo(downloadUrl).subscribe((report) => {
      expect(report.blob.size).toBeGreaterThan(0);
      expect(report.fileName).toBe(expectedFileName);
    });

    const request = httpMock.expectOne(`http://localhost:16000${downloadUrl}`);
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    expect(request.request.headers.get('X-Tenant-Url')).toBe(tenantDomain);
    request.flush(new Blob(['report']));
  });
});
