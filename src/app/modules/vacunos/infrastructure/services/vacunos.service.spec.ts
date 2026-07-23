import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@core/api/api.config';
import { VacunoService } from './vacunos.service';

describe('VacunoService', () => {
  let service: VacunoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VacunoService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api/v1' },
      ],
    });

    service = TestBed.inject(VacunoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('mapea la lista del backend al modelo de dominio', () => {
    service.getAll({ page: 2, pageSize: 5, search: 'Luna' }).subscribe((result) => {
      expect(result.items).toHaveLength(1);
      expect(result.items[0].codigo).toBe('VAC-001');
      expect(result.items[0].estado).toBe('vivo');
      expect(result.paginaActual).toBe(2);
      expect(result.totalPaginas).toBe(3);
    });

    const req = httpMock.expectOne((request) => request.url === '/api/v1/vacunos');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('5');
    expect(req.request.params.get('search')).toBe('Luna');

    req.flush({
      data: [
        {
          id: 1,
          codigo: 'VAC-001',
          nombre: 'Luna',
          fechaNacimiento: '2025-01-10',
          razaCode: 'HOLSTEIN',
          sexoCode: 'HEMBRA',
          procedencia: 'Lima',
          estado: 'Activo',
          createdAt: '2026-01-02T10:00:00Z',
        },
      ],
      pagination: {
        page: 2,
        pageSize: 5,
        total: 11,
        totalPages: 3,
      },
    });
  });

  it('envia el payload normalizado al crear un vacuno', () => {
    service.create({
      codigo: 'VAC-002',
      nombre: 'Sol',
      fechaNacimiento: '2025-02-12',
      adquisicionPor: 'NACIMIENTO',
      raza: 'JERSEY',
      color: 'MARRON',
      sexo: 'HEMBRA',
      codigoPadre: '',
      codigoMadre: '',
      granjaId: 3,
      aptoPara: 'LECHE',
      fechaEspecificacion: '2026-01-01',
      observaciones: '  registro inicial  ',
    }).subscribe((result) => {
      expect(result.codigo).toBe('VAC-002');
    });

    const req = httpMock.expectOne('/api/v1/vacunos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({
      codigo: 'VAC-002',
      tipoAdquisicionCode: 'NACIMIENTO',
      razaCode: 'JERSEY',
      sexoCode: 'HEMBRA',
      granjaId: 3,
      observaciones: 'registro inicial',
    });

    req.flush({
      data: {
        codigo: 'VAC-002',
        nombre: 'Sol',
        fechaNacimiento: '2025-02-12',
        adquisicionPor: 'NACIMIENTO',
        creadoEn: '2026-01-01T00:00:00Z',
      },
      success: true,
      errorMessage: null,
    });
  });
});
