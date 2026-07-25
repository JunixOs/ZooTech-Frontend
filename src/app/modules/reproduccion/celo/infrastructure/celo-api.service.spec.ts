import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '@env/environment';
import { CeloApiService } from './celo-api.service';

describe('CeloApiService', () => {
  let service: CeloApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CeloApiService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CeloApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('obtiene el detalle real de celo de una vaca', () => {
    service.obtenerHistorialCeloPorVacuno('VAC-001', 306).subscribe((detalle) => {
      expect(detalle.historial).toHaveLength(1);
      expect(detalle.historial[0].resultado).toBe(true);
      expect(detalle.resumen.crias).toBe(2);
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/api/v1/celo/vacunos/VAC-001/historial?registroId=306`);
    expect(request.request.method).toBe('GET');
    request.flush({
      success: true,
      errorMessage: null,
      data: {
        encargado: 'Ana',
        historial: [{ numero: 2, fechaHora: '2026-07-24T10:00:00', resultado: true }],
        resumen: { celos: 2, embarazos: 1, fecundaciones: 2, crias: 2, montas: 1, inseminaciones: 1, ultimoParto: '2026-03-15' },
      },
    });
  });
});
