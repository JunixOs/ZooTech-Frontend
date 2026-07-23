import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it, afterEach } from 'vitest';

import { API_BASE_URL } from '@core/api/api.config';
import { VacunosApiService } from './vacunos.api.service';

describe('VacunosApiService', () => {
  let service: VacunosApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VacunosApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:5085/api/v1' },
      ],
    });

    service = TestBed.inject(VacunosApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('eliminarVacuno realiza DELETE /vacuno/{id} con body motivoEliminacion', () => {
    service.eliminarVacuno('VAC-001', 'Duplicado operativo').subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:5085/api/v1/vacuno/VAC-001');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ motivoEliminacion: 'Duplicado operativo' });

    req.flush(null);
  });
});
