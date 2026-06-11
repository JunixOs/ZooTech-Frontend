import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LecheService } from './leche.service';
import { LecheVacunoOption, OrdenioDTO } from '@modules/leche/domain/models/leche.model';

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
});
