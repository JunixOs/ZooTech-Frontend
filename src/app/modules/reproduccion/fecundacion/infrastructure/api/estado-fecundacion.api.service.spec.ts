import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '@core/api/api.config';
import { EstadoFecundacionApiService } from './estado-fecundacion.api.service';

describe('EstadoFecundacionApiService', () => {
  let service: EstadoFecundacionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EstadoFecundacionApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:5085/api/v1' },
      ],
    });

    service = TestBed.inject(EstadoFecundacionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('consulta GET /api/reproduccion/fecundacion/estado/{vacunoId}', () => {
    service.obtenerEstado(7).subscribe((estado) => {
      expect(estado.codigoVacuno).toBe('VAC-007');
      expect(estado.fecundacionId).toBe(21);
      expect(estado.ultimoRegistroActivo?.toroDonante).toBe('TOR-001 - Atlas');
    });

    const req = httpMock.expectOne('http://localhost:5085/api/reproduccion/fecundacion/estado/7');
    expect(req.request.method).toBe('GET');

    req.flush({
      data: {
        vacunoId: 7,
        fecundacionId: 21,
        codigoVacuno: 'VAC-007',
        nombreVacuno: 'Luna',
        raza: 'Jersey',
        estadoFecundacion: 'pendiente',
        ultimaActualizacion: '2026-07-01',
        ultimoRegistroActivo: {
          codigoRegistro: 'FEC-021',
          activo: true,
          tipoFecundacion: 'IA',
          vacunoReceptor: 'VAC-007 - Luna',
          toroDonante: 'TOR-001 - Atlas',
          fechaProcedimiento: '2026-06-30',
          responsable: 'Dra. Ana Torres',
          resultadoRegistrado: 'Pendiente',
          observacionesVeterinarias: 'Control programado',
        },
      },
    });
  });

  it('actualiza PUT /api/reproduccion/fecundacion/estado/{fecundacionId}', () => {
    service.actualizarEstado(21, 'confirmada').subscribe((estado) => {
      expect(estado.estadoReproductivoActual).toBe('confirmada');
    });

    const req = httpMock.expectOne('http://localhost:5085/api/reproduccion/fecundacion/estado/21');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ estadoFecundacion: 'confirmada' });

    req.flush({
      data: {
        vacunoId: 7,
        fecundacionId: 21,
        codigoVacuno: 'VAC-007',
        nombreVacuno: 'Luna',
        raza: 'Jersey',
        estadoReproductivoActual: 'confirmada',
        disponibleNuevaFecundacion: false,
        ultimaActualizacion: '2026-07-04',
        ultimoRegistroActivo: null,
      },
    });
  });
});
