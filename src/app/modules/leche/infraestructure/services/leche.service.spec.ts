import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LecheService } from './leche.service';
import { LecheVacunoOption, OrdenioDTO, UpdateLecheRequest } from '@modules/leche/domain/models/leche.model';

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
        expect(result).toHaveLength(1);
        expect(result[0].codigoRegistro).toBe('ORD-001');
        expect(result[0].litros).toBe(10);
      });

      const req = httpMock.expectOne((r) => r.url.includes('produccion-leche'));
      req.flush({ data: [dto] });
    });

    it('retorna array vacío cuando data es []', () => {
      service.getAll().subscribe((result) => {
        expect(result).toHaveLength(0);
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
        expect(result).toHaveLength(1);
        expect(result[0].codigoRegistro).toBe('ORD-002');
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
        expect(result).toHaveLength(1);
        expect(result[0].codigoRegistro).toBe('ORD-003');
      });

      httpMock.expectOne((r) => r.url.includes('produccion-leche')).flush({
        data: {
          items: [dto],
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

  describe('getVacasEnSequia', () => {
    it('calcula sequia desde ordeños sin usar un endpoint dedicado', () => {
      const ordenios: OrdenioDTO[] = [
        {
          id: 1,
          codigo: 'ORD-001',
          fechaHora: '2026-06-01T08:00:00',
          vacunoId: 1,
          nombreVacuno: 'Luna',
          encargadoUsuarioId: 1,
          estadoOrdenioCode: 'ACTIVO',
          litros: 12,
        },
        {
          id: 2,
          codigo: 'ORD-002',
          fechaHora: '2026-06-12T08:00:00',
          vacunoId: 1,
          nombreVacuno: 'Luna',
          encargadoUsuarioId: 1,
          estadoOrdenioCode: 'ACTIVO',
          litros: 11,
        },
        {
          id: 3,
          codigo: 'ORD-003',
          fechaHora: '2026-06-01T08:00:00',
          vacunoId: 2,
          nombreVacuno: 'Sol',
          encargadoUsuarioId: 1,
          estadoOrdenioCode: 'ACTIVO',
          litros: 10,
        },
        {
          id: 4,
          codigo: 'ORD-004',
          fechaHora: '2026-06-08T08:00:00',
          vacunoId: 3,
          nombreVacuno: 'Brisa',
          encargadoUsuarioId: 1,
          estadoOrdenioCode: 'ACTIVO',
          litros: 9,
        },
      ];
      const vacunos: LecheVacunoOption[] = [
        { id: 1, codigo: 'VAC-001', nombre: 'Luna' },
        { id: 2, codigo: 'VAC-002', nombre: 'Sol' },
        { id: 3, codigo: 'VAC-003', nombre: 'Brisa' },
      ];

      service
        .getVacasEnSequia({ fechaHasta: '10/06/2026' })
        .subscribe((result) => {
          expect(result.actuales).toEqual([
            {
              vacunoId: '2',
              codigoVacuno: 'VAC-002',
              nombreVacuno: 'Sol',
              desde: '08/06/2026',
              probablementeHasta: '',
            },
          ]);

          expect(result.futuros).toEqual([
            {
              vacunoId: '3',
              codigoVacuno: 'VAC-003',
              nombreVacuno: 'Brisa',
              probablementeDesde: '15/06/2026',
              probablementeHasta: '',
            },
            {
              vacunoId: '1',
              codigoVacuno: 'VAC-001',
              nombreVacuno: 'Luna',
              probablementeDesde: '19/06/2026',
              probablementeHasta: '',
            },
          ]);

          expect(result.historicos).toEqual([
            {
              vacunoId: '1',
              codigoVacuno: 'VAC-001',
              nombreVacuno: 'Luna',
              desde: '08/06/2026',
              hasta: '11/06/2026',
            },
          ]);
        });

      const ordeniosReq = httpMock.expectOne((r) => r.url.endsWith('/produccion-leche'));
      expect(ordeniosReq.request.method).toBe('GET');
      ordeniosReq.flush({ data: ordenios });

      const vacunosReq = httpMock.expectOne((r) => r.url.endsWith('/produccion-leche/vacunos'));
      expect(vacunosReq.request.method).toBe('GET');
      vacunosReq.flush({ data: vacunos });
    });
  });

  describe('updateById', () => {
    it('envia el payload requerido del patch con campos automaticos', () => {
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
});
