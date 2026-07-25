import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CeloApiService } from '../infrastructure/celo-api.service';
import { CeloFacade } from './celo.facade';

describe('CeloFacade history', () => {
  let facade: CeloFacade;
  const api = { obtenerHistorialCeloPorVacuno: vi.fn() };

  beforeEach(() => {
    api.obtenerHistorialCeloPorVacuno.mockReset();
    TestBed.configureTestingModule({ providers: [CeloFacade, { provide: CeloApiService, useValue: api }] });
    facade = TestBed.inject(CeloFacade);
  });

  it('guarda el historial y resumen de la vaca sin activar la carga global', () => {
    api.obtenerHistorialCeloPorVacuno.mockReturnValue(of({
      encargado: 'Ana',
      historial: [{ numero: 1, fechaHora: '2026-07-24T10:00:00', resultado: true }],
      resumen: { celos: 1, embarazos: 0, fecundaciones: 1, crias: 0, montas: 0, inseminaciones: 1, ultimoParto: null },
    }));

    facade.cargarHistorialCeloPorVacuno('VAC-001', 306);

    expect(api.obtenerHistorialCeloPorVacuno).toHaveBeenCalledWith('VAC-001', 306);
    expect(facade.historialCeloPorVacuno()).toHaveLength(1);
    expect(facade.resumenCeloPorVacuno()?.celos).toBe(1);
    expect(facade.encargadoCeloPorVacuno()).toBe('Ana');
    expect(facade.historialCeloLoading()).toBe(false);
    expect(facade.isLoading()).toBe(false);
  });

  it('expone el error cuando falla la consulta del historial', () => {
    api.obtenerHistorialCeloPorVacuno.mockReturnValue(throwError(() => new Error('No disponible')));

    facade.cargarHistorialCeloPorVacuno('VAC-001', 306);

    expect(facade.historialCeloError()).toBe('No disponible');
    expect(facade.historialCeloLoading()).toBe(false);
  });
});
