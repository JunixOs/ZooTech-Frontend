import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TriajeService } from './triaje.service';
import {
  RegistrarTriajePayload,
  TriajeDTO,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
} from '@modules/sanidad/domain/models/triaje.model';

describe('TriajeService', () => {
  let service: TriajeService;
  let httpMock: HttpTestingController;

  const dto: TriajeDTO = {
    id: 1,
    codigo: 'TRI-001',
    fechaHora: '2026-07-22T10:30:00',
    vacunoId: 5,
    vacunoNombre: 'Luna',
    tipoPesoCode: 'CONTROL',
    pesoKg: 120.5,
    observaciones: 'Sin novedad',
    estadoRegistroCode: 'ACTIVO',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TriajeService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TriajeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getAll', () => {
    it('envia query params y normaliza respuesta paginada del backend', () => {
      service.getAll({
        page: 2,
        pageSize: 25,
        fecha: '2026-07-22',
        fechaDesde: '2026-07-01',
        fechaHasta: '2026-07-31',
        vacunoId: '5',
        codigo: 'TRI',
        vacunoNombre: 'Luna',
        tipoPeso: 'CONTROL',
        pesoKg: '120',
        uniqueVacuno: true,
      }).subscribe((result) => {
        expect(result.items).toHaveLength(1);
        expect(result.items[0].codigo).toBe('TRI-001');
        expect(result.totalItems).toBe(10);
        expect(result.paginaActual).toBe(2);
        expect(result.totalPaginas).toBe(1);
        expect(result.limitePorPagina).toBe(25);
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pagina')).toBe('2');
      expect(req.request.params.get('tamano')).toBe('25');
      expect(req.request.params.get('fecha')).toBe('2026-07-22');
      expect(req.request.params.get('fechaDesde')).toBe('2026-07-01');
      expect(req.request.params.get('fechaHasta')).toBe('2026-07-31');
      expect(req.request.params.get('vacunoId')).toBe('5');
      expect(req.request.params.get('codigo')).toBe('TRI');
      expect(req.request.params.get('nombre')).toBe('Luna');
      expect(req.request.params.get('tipoPeso')).toBe('CONTROL');
      expect(req.request.params.get('pesoKg')).toBe('120');
      expect(req.request.params.get('uniqueVacuno')).toBe('true');
      req.flush({
        data: {
          data: [dto],
          totalRegistros: 10,
          pagina: 2,
          tamano: 25,
          totalPaginas: 1,
        },
        success: true,
        errorMessage: null,
      });
    });

    it('usa cache para consultas repetidas con los mismos filtros', () => {
      const filtros = { codigo: 'TRI-001' };

      service.getAll(filtros).subscribe((result) => {
        expect(result.items[0].codigo).toBe('TRI-001');
      });
      httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje')).flush({
        data: [dto],
        success: true,
        errorMessage: null,
      });

      service.getAll(filtros).subscribe((result) => {
        expect(result.items[0].codigo).toBe('TRI-001');
      });

      httpMock.expectNone((r) => r.url.endsWith('/api/v1/triaje'));
    });

    it('normaliza formato alternativo con items', () => {
      service.getAll().subscribe((result) => {
        expect(result.totalItems).toBe(1);
        expect(result.items[0].vacunoNombre).toBe('Luna');
      });

      httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje')).flush({
        data: {
          items: [dto],
          totalItems: 1,
          paginaActual: 1,
          totalPaginas: 1,
          limitePorPagina: 10,
        },
        success: true,
        errorMessage: null,
      });
    });

    it('normaliza formato alternativo con pagination', () => {
      service.getAll().subscribe((result) => {
        expect(result.totalItems).toBe(3);
        expect(result.paginaActual).toBe(1);
        expect(result.limitePorPagina).toBe(10);
      });

      httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje')).flush({
        data: {
          data: [dto],
          pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
        },
        success: true,
        errorMessage: null,
      });
    });
  });

  describe('CRUD', () => {
    it('crea un triaje con POST y mapea respuesta', () => {
      const payload: RegistrarTriajePayload = {
        fechaHora: '2026-07-22T10:30',
        vacunoId: 5,
        tipoPesoCode: 'CONTROL',
        pesoKg: 120.5,
        observaciones: null,
        estadoRegistroCode: 'ACTIVO',
        encargadoUsuarioId: null,
      };

      service.create(payload).subscribe((result) => {
        expect(result.codigo).toBe('TRI-001');
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ data: dto, success: true, errorMessage: null });
    });

    it('obtiene un triaje por id', () => {
      service.getById(1).subscribe((result) => {
        expect(result.id).toBe(1);
        expect(result.codigo).toBe('TRI-001');
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje/1'));
      expect(req.request.method).toBe('GET');
      req.flush({ data: dto, success: true, errorMessage: null });
    });

    it('actualiza un triaje con PATCH', () => {
      const payload = { tipoPesoCode: 'CONTROL', pesoKg: 121, observaciones: 'Editado' };
      const spy = vi.fn();

      service.update(1, payload).subscribe(spy);

      const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje/1'));
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
      expect(spy).toHaveBeenCalled();
    });

    it('elimina un triaje enviando body', () => {
      const payload = { motivoEliminacion: 'Registro duplicado' };
      const spy = vi.fn();

      service.delete(1, payload).subscribe(spy);

      const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje/1'));
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
      expect(spy).toHaveBeenCalled();
    });
  });

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

  describe('historial y reportes', () => {
    it('consulta historial por vacuno con rango opcional', () => {
      service.getHistorialByVacunoId(5, '2026-07-01', '2026-07-31').subscribe((result) => {
        expect(result).toEqual([{ id: 1, fechaHora: '2026-07-22T10:30:00', pesoKg: 120, tipoPesoCode: 'CONTROL' }]);
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje/historial/5'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('desde')).toBe('2026-07-01');
      expect(req.request.params.get('hasta')).toBe('2026-07-31');
      req.flush({
        data: [{ id: 1, fechaHora: '2026-07-22T10:30:00', pesoKg: 120, tipoPesoCode: 'CONTROL' }],
        success: true,
        errorMessage: null,
      });
    });

    it('consulta historial general con rango opcional', () => {
      service.getHistorialGeneral('2026-07-01', '2026-07-31').subscribe((result) => {
        expect(result).toHaveLength(1);
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje/historial-general'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('desde')).toBe('2026-07-01');
      expect(req.request.params.get('hasta')).toBe('2026-07-31');
      req.flush({
        data: [{ id: 1, fechaHora: '2026-07-22T10:30:00', pesoKg: 120, tipoPesoCode: 'CONTROL' }],
        success: true,
        errorMessage: null,
      });
    });

    it('descarga excel con filtros y responseType blob', () => {
      service.downloadExcel({ fechaDesde: '2026-07-01', pesoKg: '120' }).subscribe((blob) => {
        expect(blob).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje/reporte/excel'));
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      expect(req.request.params.get('fechaDesde')).toBe('2026-07-01');
      expect(req.request.params.get('pesoKg')).toBe('120');
      req.flush(new Blob(['excel']));
    });

    it('descarga pdf con filtros y responseType blob', () => {
      service.downloadPdf({ vacunoId: '5' }).subscribe((blob) => {
        expect(blob).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/triaje/reporte/pdf'));
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      expect(req.request.params.get('vacunoId')).toBe('5');
      req.flush(new Blob(['pdf']));
    });
  });
});
