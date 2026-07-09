import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@core/api/api.config';
import { FecundacionApiService } from './fecundacion.api.service';

describe('FecundacionApiService', () => {
  let service: FecundacionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FecundacionApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api/v1' },
      ],
    });

    service = TestBed.inject(FecundacionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lista fecundaciones con filtros de paginacion y resultado', () => {
    service.listarFecundaciones({
      page: 1,
      pageSize: 10,
      search: 'VAC-001',
      resultado: 'EXITOSA',
    }).subscribe((result) => {
      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.data[0].codigoFecundacion).toBe('FEC-001');
    });

    const req = httpMock.expectOne((request) => request.url === '/api/v1/fecundaciones');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('search')).toBe('VAC-001');
    expect(req.request.params.get('resultado')).toBe('EXITOSA');

    req.flush({
      data: [
        {
          id: 1,
          codigoFecundacion: 'FEC-001',
          fechaProcedimiento: '2026-01-01',
          nombreVacunoReceptor: 'Luna',
          responsable: 'Vet',
          tipoFecundacion: 'IA',
          codigoResultado: 'EXITOSA',
          nombreDonante: 'Toro A',
        },
      ],
      page: 1,
      pageSize: 10,
      limit: 10,
      totalCount: 1,
      success: true,
      errorMessage: null,
    });
  });

  it('desenvuelve las opciones de vacunos desde data', () => {
    service.buscarVacunos('hembra', 'Luna', true, 7).subscribe((result) => {
      expect(result).toEqual([
        { id: 1, codigo: 'VAC-001', nombre: 'Luna', sexo: 'HEMBRA' },
      ]);
    });

    const req = httpMock.expectOne((request) => request.url === '/api/v1/fecundaciones/vacunos');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('sexo')).toBe('hembra');
    expect(req.request.params.get('q')).toBe('Luna');
    expect(req.request.params.get('soloDisponibles')).toBe('true');
    expect(req.request.params.get('excluirFecundacionId')).toBe('7');

    req.flush({
      data: [
        { id: 1, codigo: 'VAC-001', nombre: 'Luna', sexo: 'HEMBRA' },
      ],
      success: true,
      errorMessage: null,
    });
  });
});
