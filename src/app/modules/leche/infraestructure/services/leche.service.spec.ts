import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LecheVacunoOption, OrdenioDTO } from '@modules/leche/domain/models/leche.model';
import { LecheService } from './leche.service';

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
    it('desenvuelve data y mapea a dominio', () => {
      const dto: OrdenioDTO = {
        id: 1,
        fechaOrdenio: '2026-06-10T08:00:00',
        vacunoId: 3,
        encargadoUsuarioId: 1,
        estadoOrdenioCode: 'ACTIVO',
        cantidadLitros: 10,
      };

      service.getAll().subscribe((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].codigoRegistro).toBe('1');
        expect(result[0].litros).toBe(10);
      });

      const req = httpMock.expectOne((request) => request.url.includes('produccion-leche'));
      req.flush({
        data: {
          data: [dto],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
        success: true,
        errorMessage: null,
      });
    });

    it('retorna array vacio cuando data no tiene registros', () => {
      service.getAll().subscribe((result) => {
        expect(result).toHaveLength(0);
      });

      httpMock.expectOne((request) => request.url.includes('produccion-leche')).flush({
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
        success: true,
        errorMessage: null,
      });
    });
  });

  describe('getVacunos', () => {
    it('desenvuelve data y retorna las opciones', () => {
      const opciones: LecheVacunoOption[] = [
        { id: 1, codigo: 'VAC-001', nombre: 'Clarita' },
        { id: 2, codigo: 'VAC-002', nombre: 'Negra' },
      ];

      service.getVacunos().subscribe((result) => {
        expect(result).toHaveLength(2);
        expect(result[0].nombre).toBe('Clarita');
        expect(result[1].codigo).toBe('VAC-002');
      });

      const req = httpMock.expectOne((request) => request.url.includes('vacunos'));
      expect(req.request.method).toBe('GET');
      req.flush({ data: opciones });
    });

    it('retorna array vacio cuando data no tiene registros', () => {
      service.getVacunos().subscribe((result) => {
        expect(result).toHaveLength(0);
      });

      httpMock.expectOne((request) => request.url.includes('vacunos')).flush({ data: [] });
    });
  });
});
