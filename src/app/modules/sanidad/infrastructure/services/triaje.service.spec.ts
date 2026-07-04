import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TriajeService } from './triaje.service';
import { TriajeTipoPesoOption, TriajeVacunoOption } from '@modules/sanidad/domain/models/triaje.model';

describe('TriajeService', () => {
  let service: TriajeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TriajeService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TriajeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getTiposPeso', () => {
    it('desenvuelve { data: [] } y retorna los tipos de peso', () => {
      const tipos: TriajeTipoPesoOption[] = [
        { code: 'VIVO', nombre: 'Peso vivo' },
        { code: 'CANAL', nombre: 'Peso canal' },
      ];

      service.getTiposPeso().subscribe((result) => {
        expect(result).toHaveLength(2);
        expect(result[0].code).toBe('VIVO');
        expect(result[1].nombre).toBe('Peso canal');
      });

      const req = httpMock.expectOne((r) => r.url.includes('tipos-peso'));
      expect(req.request.method).toBe('GET');
      req.flush({ data: tipos });
    });

    it('retorna array vacío cuando data es []', () => {
      service.getTiposPeso().subscribe((result) => {
        expect(result).toHaveLength(0);
      });
      httpMock.expectOne((r) => r.url.includes('tipos-peso')).flush({ data: [] });
    });
  });

  describe('getVacunos', () => {
    it('desenvuelve { data: [] } y retorna las opciones de vacunos', () => {
      const vacunos: TriajeVacunoOption[] = [
        { id: 1, codigo: 'VAC-001', nombre: 'Estrella' },
        { id: 2, codigo: 'VAC-002', nombre: 'Luna' },
      ];

      service.getVacunos().subscribe((result) => {
        expect(result).toHaveLength(2);
        expect(result[0].codigo).toBe('VAC-001');
        expect(result[1].nombre).toBe('Luna');
      });

      const req = httpMock.expectOne((r) => r.url.includes('triaje/vacunos'));
      expect(req.request.method).toBe('GET');
      req.flush({ data: vacunos });
    });

    it('retorna array vacío cuando data es []', () => {
      service.getVacunos().subscribe((result) => {
        expect(result).toHaveLength(0);
      });
      httpMock.expectOne((r) => r.url.includes('triaje/vacunos')).flush({ data: [] });
    });
  });
});
