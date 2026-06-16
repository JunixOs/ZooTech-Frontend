import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@core/api/api.config';
import { ReporteVacunoApiService } from './reporte-vacuno.api.service';

describe('ReporteVacunoApiService', () => {
  let service: ReporteVacunoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReporteVacunoApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:5085/api/v1' },
      ],
    });

    service = TestBed.inject(ReporteVacunoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('consulta GET /api/reports/animals con los filtros del contrato', () => {
    service
      .listar({
        FechaInicio: '2026-05-18',
        FechaFin: '2026-06-16',
        Keyword: 'Luna',
        RazaCode: 'JER',
        SexoCode: 'H',
        TipoAdquisicionCode: 'COMPRA',
        GranjaId: 7,
        EstadoCode: 'vivo',
      })
      .subscribe((response) => {
        expect(response.data[0]).toEqual({
          id: 1,
          codigo: 'VAC-001',
          nombre: 'Luna',
          fechaNacimiento: '2024-01-10',
          tipoAdquisicion: 'Compra',
          raza: 'Jersey',
          color: 'Marron',
          sexo: 'Hembra',
          granja: 'Granja Norte',
          estado: 'vivo',
          fechaRegistro: '2026-06-01',
        });
        expect(response.resumen.totalVacunos).toBe(1);
      });

    const req = httpMock.expectOne((request) => request.url === 'http://localhost:5085/api/reports/animals');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('FechaInicio')).toBe('2026-05-18');
    expect(req.request.params.get('FechaFin')).toBe('2026-06-16');
    expect(req.request.params.get('Keyword')).toBe('Luna');
    expect(req.request.params.get('RazaCode')).toBe('JER');
    expect(req.request.params.get('SexoCode')).toBe('H');
    expect(req.request.params.get('TipoAdquisicionCode')).toBe('COMPRA');
    expect(req.request.params.get('GranjaId')).toBe('7');
    expect(req.request.params.get('EstadoCode')).toBe('vivo');
    expect(req.request.params.has('q')).toBe(false);

    req.flush({
      Data: [
        {
          Id: 1,
          Codigo: 'VAC-001',
          Nombre: 'Luna',
          FechaNacimiento: '2024-01-10',
          TipoAdquisicion: 'Compra',
          Raza: 'Jersey',
          Color: 'Marron',
          Sexo: 'Hembra',
          Granja: 'Granja Norte',
          Estado: 'vivo',
          FechaRegistro: '2026-06-01',
        },
      ],
      Resumen: { TotalVacunos: 1 },
    });
  });

  it('omite filtros vacios al construir query params', () => {
    service.listar({ FechaInicio: '', FechaFin: undefined, Keyword: 'VAC' }).subscribe();

    const req = httpMock.expectOne((request) => request.url === 'http://localhost:5085/api/reports/animals');
    expect(req.request.params.has('FechaInicio')).toBe(false);
    expect(req.request.params.has('FechaFin')).toBe(false);
    expect(req.request.params.get('Keyword')).toBe('VAC');

    req.flush([]);
  });

  it('mapea la respuesta real del backend con items y total', () => {
    service.listar({ FechaInicio: '2026-05-18', FechaFin: '2026-06-16' }).subscribe((response) => {
      expect(response.resumen.totalVacunos).toBe(7);
      expect(response.data).toHaveLength(1);
      expect(response.data[0]).toMatchObject({
        codigo: 'VAC-VIDEO',
        nombre: 'Vaca Demostracion',
        fechaNacimiento: '2026-05-01',
        tipoAdquisicion: 'Compra',
        raza: 'Holstein',
        color: 'Negro y Blanco',
        sexo: 'Hembra',
        granja: 'Granja Los Andes',
        estado: 'No especificado',
        fechaRegistro: '2026-05-21',
      });
    });

    const req = httpMock.expectOne((request) => request.url === 'http://localhost:5085/api/reports/animals');
    expect(req.request.method).toBe('GET');

    req.flush({
      fechaInicio: '2026-05-18',
      fechaFin: '2026-06-16',
      keyword: null,
      total: 7,
      items: [
        {
          codigo: 'VAC-VIDEO',
          nombre: 'Vaca Demostracion',
          fechaNacimiento: '2026-05-01',
          tipoAdquisicion: 'Compra',
          raza: 'Holstein',
          color: 'Negro y Blanco',
          sexo: 'Hembra',
          granja: 'Granja Los Andes',
          estado: 'No especificado',
          fechaRegistro: '2026-05-21',
        },
      ],
    });
  });

  it('descarga Excel usando los mismos filtros activos', () => {
    service.descargarListado('excel', { Keyword: 'VAC-001', EstadoCode: 'vivo' }).subscribe((blob) => {
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    const req = httpMock.expectOne((request) => request.url === 'http://localhost:5085/api/reports/animals/excel');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('Keyword')).toBe('VAC-001');
    expect(req.request.params.get('EstadoCode')).toBe('vivo');

    req.flush(new Blob(['excel'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  });

  it('descarga PDF usando los mismos filtros activos', () => {
    service.descargarListado('pdf', { RazaCode: 'JER' }).subscribe((blob) => {
      expect(blob.type).toBe('application/pdf');
    });

    const req = httpMock.expectOne((request) => request.url === 'http://localhost:5085/api/reports/animals/pdf');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('RazaCode')).toBe('JER');

    req.flush(new Blob(['pdf'], { type: 'application/pdf' }));
  });
});
