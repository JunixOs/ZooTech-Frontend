import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LecheService } from './leche.service';
import {
  LecheVacunoOption,
  OrdenioDTO,
  RegistrarLecheRequest,
  UpdateLecheRequest,
} from '@modules/leche/domain/models/leche.model';

describe('LecheService', () => {
  let service: LecheService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LecheService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LecheService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getAll', () => {
    it('desenvuelve { data: [] } y mapea a dominio', () => {
      const dto: OrdenioDTO = {
        id: 1,
        codigo: 'ORD-001',
        fechaHora: '2026-06-10T08:00:00',
        vacunoId: 3,
        nombreVacuno: null,
        encargadoUsuarioId: 1,
        estadoOrdenioCode: 'ACTIVO',
        litros: 10,
      };

      service.getAll().subscribe((result) => {
        expect(result.items).toHaveLength(1);
        expect(result.items[0].codigoRegistro).toBe('ORD-001');
        expect(result.items[0].litros).toBe(10);
        expect(result.totalItems).toBe(1);
      });

      const req = httpMock.expectOne((r) => r.url.includes('produccion-leche'));
      req.flush({ data: [dto] });
    });

    it('retorna array vacío cuando data es []', () => {
      service.getAll().subscribe((result) => {
        expect(result.items).toHaveLength(0);
        expect(result.totalItems).toBe(0);
      });
      httpMock.expectOne((r) => r.url.includes('produccion-leche')).flush({ data: [] });
    });

    it('desenvuelve listas paginadas cuando el backend retorna data.data', () => {
      const dto: OrdenioDTO = {
        id: 2,
        codigo: 'ORD-002',
        fechaHora: '2026-06-10T15:00:00',
        vacunoId: 4,
        nombreVacuno: null,
        encargadoUsuarioId: 1,
        estadoOrdenioCode: 'ACTIVO',
        litros: 8,
      };

      service.getAll().subscribe((result) => {
        expect(result.items).toHaveLength(1);
        expect(result.items[0].codigoRegistro).toBe('ORD-002');
        expect(result.totalItems).toBe(1);
        expect(result.paginaActual).toBe(1);
        expect(result.limitePorPagina).toBe(10);
      });

      httpMock.expectOne((r) => r.url.includes('produccion-leche')).flush({
        data: {
          data: [dto],
          totalRegistros: 1,
          pagina: 1,
          tamano: 10,
          totalPaginas: 1,
        },
      });
    });

    it('desenvuelve listas paginadas cuando el backend retorna data.items', () => {
      const dto: OrdenioDTO = {
        id: 3,
        codigo: 'ORD-003',
        fechaHora: '2026-06-10T06:00:00',
        vacunoId: 5,
        nombreVacuno: null,
        encargadoUsuarioId: 1,
        estadoOrdenioCode: 'ACTIVO',
        litros: 6,
      };

      service.getAll().subscribe((result) => {
        expect(result.items).toHaveLength(1);
        expect(result.items[0].codigoRegistro).toBe('ORD-003');
        expect(result.totalItems).toBe(1);
      });

      httpMock.expectOne((r) => r.url.includes('produccion-leche')).flush({
        data: {
          items: [dto],
        },
      });
    });

    it('lee metadatos de paginacion en el envelope principal cuando la pagina es explicita', () => {
      const dto: OrdenioDTO = {
        id: 4,
        codigo: 'ORD-004',
        fechaHora: '2026-06-11T06:00:00',
        vacunoId: 6,
        nombreVacuno: null,
        encargadoUsuarioId: 1,
        estadoOrdenioCode: 'ACTIVO',
        litros: 7,
      };

      service.getAll({ page: 1, pageSize: 20 }).subscribe((result) => {
        expect(result.items).toHaveLength(1);
        expect(result.totalItems).toBe(100);
        expect(result.paginaActual).toBe(1);
        expect(result.totalPaginas).toBe(5);
        expect(result.limitePorPagina).toBe(20);
      });

      const req = httpMock.expectOne((r) => r.url.includes('produccion-leche'));
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('20');
      req.flush({
        data: [dto],
        page: 1,
        pageSize: 20,
        totalCount: 100,
      });
    });

    it('no dispara cargas automaticas de paginas cuando no se pide una pagina explicita', () => {
      const dto1: OrdenioDTO = {
        id: 5,
        codigo: 'ORD-005',
        fechaHora: '2026-06-12T06:00:00',
        vacunoId: 7,
        nombreVacuno: null,
        encargadoUsuarioId: 1,
        estadoOrdenioCode: 'ACTIVO',
        litros: 5,
      };

      service.getAll().subscribe((result) => {
        expect(result.items.map((item) => item.codigoRegistro)).toEqual(['ORD-005']);
        expect(result.totalItems).toBe(2);
        expect(result.paginaActual).toBe(1);
      });

      const firstReq = httpMock.expectOne((r) => r.url.includes('produccion-leche'));
      expect(firstReq.request.params.get('page')).toBeNull();
      expect(firstReq.request.params.get('pageSize')).toBeNull();
      firstReq.flush({
        data: [dto1],
        pagination: {
          page: 1,
          pageSize: 1,
          total: 2,
          totalPages: 2,
        },
      });
    });
  });

  describe('getVacunos', () => {
    it('desenvuelve { data: [] } y retorna las opciones', () => {
      const opciones: LecheVacunoOption[] = [
        { id: 1, codigo: 'VAC-001', nombre: 'Clarita' },
        { id: 2, codigo: 'VAC-002', nombre: 'Negra' },
      ];

      service.getVacunos().subscribe((result) => {
        expect(result).toHaveLength(2);
        expect(result[0].nombre).toBe('Clarita');
        expect(result[1].codigo).toBe('VAC-002');
      });

      const req = httpMock.expectOne((r) => r.url.includes('vacunos'));
      expect(req.request.method).toBe('GET');
      req.flush({ data: opciones });
    });

    it('retorna array vacío cuando data es []', () => {
      service.getVacunos().subscribe((result) => {
        expect(result).toHaveLength(0);
      });
      httpMock.expectOne((r) => r.url.includes('vacunos')).flush({ data: [] });
    });
  });

  describe('updateById', () => {
    it('envia el payload completo requerido por el patch', () => {
      const payload: UpdateLecheRequest = {
        fechaHora: '2026-05-28T09:36:00',
        encargadoUsuarioId: '1',
        litros: 12,
        estadoOrdenioCode: 'ACTIVO',
        observaciones: 'FUNCIONA O NO',
      };

      service.updateById('1', payload).subscribe();

      const req = httpMock.expectOne((r) => r.url.endsWith('/produccion-leche/1'));
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      expect(Object.keys(req.request.body)).toEqual([
        'fechaHora',
        'encargadoUsuarioId',
        'litros',
        'estadoOrdenioCode',
        'observaciones',
      ]);
      req.flush({});
    });
  });

  describe('create', () => {
    it('mapea el formulario al contrato requerido por el backend', () => {
      const payload: RegistrarLecheRequest = {
        codigo: 'ORD260709161000',
        fechaHora: '2026-07-09T16:10',
        vacunoId: 9267,
        litros: 12.21,
        encargadoUsuarioId: 4,
        estadoOrdenioCode: 'TARDE',
        observaciones: 'PRODUCCION',
      };

      service.create(payload).subscribe();

      const req = httpMock.expectOne((r) => r.url.endsWith('/produccion-leche'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        codigo: 'ORD260709161000',
        fechaHora: '2026-07-09T16:10:00',
        vacunoId: 9267,
        encargadoUsuarioId: 4,
        litros: 12.21,
        observaciones: 'PRODUCCION',
        estadoOrdenioCode: 'TARDE',
      });
      req.flush({});
    });
  });
});
