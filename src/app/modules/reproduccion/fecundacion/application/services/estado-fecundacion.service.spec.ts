import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VacunosFacade } from '@modules/vacunos/application/vacunos.facade';
import { EstadoFecundacionApiService } from '../../infrastructure/api/estado-fecundacion.api.service';
import { EstadoFecundacionService } from './estado-fecundacion.service';

const estadoResponse = {
  vacunoId: 1,
  fecundacionId: 15,
  codigoVacuno: 'VAC-001',
  nombreVacuno: 'Luna',
  raza: 'Jersey',
  estadoReproductivoActual: 'pendiente' as const,
  disponibleNuevaFecundacion: false,
  ultimaActualizacion: '2026-07-01',
  ultimoRegistroActivo: {
    codigoRegistro: 'FEC-001',
    activo: true,
    tipoFecundacion: 'IA' as const,
    vacunoReceptor: 'VAC-001 - Luna',
    toroDonante: 'TOR-001 - Atlas',
    fechaProcedimiento: '2026-06-30',
    responsable: 'Dra. Ana Torres',
    resultadoRegistrado: 'Pendiente',
    observacionesVeterinarias: 'Control programado',
  },
};

describe('EstadoFecundacionService', () => {
  let service: EstadoFecundacionService;
  let apiMock: {
    obtenerEstado: ReturnType<typeof vi.fn>;
    actualizarEstado: ReturnType<typeof vi.fn>;
  };
  let vacunosFacadeMock: {
    listarVacunos: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    apiMock = {
      obtenerEstado: vi.fn(() => of(estadoResponse)),
      actualizarEstado: vi.fn(() => of({ ...estadoResponse, estadoReproductivoActual: 'fallida', disponibleNuevaFecundacion: true })),
    };
    vacunosFacadeMock = {
      listarVacunos: vi.fn(() =>
        of({
          items: [
            { id: 1, codigo: 'VAC-001', nombre: 'Luna', raza: 'Jersey', sexo: 'hembra', fechaNacimiento: '', distrito: '', estado: 'activo' },
            { id: 2, codigo: 'VAC-002', nombre: 'Toro', raza: 'Holstein', sexo: 'macho', fechaNacimiento: '', distrito: '', estado: 'activo' },
          ],
          totalItems: 2,
          paginaActual: 1,
          totalPaginas: 1,
          limitePorPagina: 1000,
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        EstadoFecundacionService,
        { provide: EstadoFecundacionApiService, useValue: apiMock },
        { provide: VacunosFacade, useValue: vacunosFacadeMock },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
    });

    service = TestBed.inject(EstadoFecundacionService);
  });

  it('carga solo vacunos hembra activos y consulta su estado inicial', async () => {
    await service.cargarVacunosHembra();

    expect(vacunosFacadeMock.listarVacunos).toHaveBeenCalledWith({ limit: 1000, estado: 'activo' });
    expect(service.vacunosHembra()).toEqual([{ id: 1, codigoVacuno: 'VAC-001', nombreVacuno: 'Luna', raza: 'Jersey' }]);
    expect(apiMock.obtenerEstado).toHaveBeenCalledWith(1);
    expect(service.estadoActual()?.codigoVacuno).toBe('VAC-001');
  });

  it('busca vacunos hembra por codigo o nombre', async () => {
    await service.cargarVacunosHembra();

    expect(service.buscarVacunosHembra('luna')).toHaveLength(1);
    expect(service.buscarVacunosHembra('VAC-001')[0].nombreVacuno).toBe('Luna');
  });

  it('actualiza solo el estado usando el fecundacionId del contrato', async () => {
    await service.cargarVacunosHembra();
    await service.actualizarEstado('fallida');

    expect(apiMock.actualizarEstado).toHaveBeenCalledWith(15, 'fallida');
    expect(service.estadoActual()?.estadoReproductivoActual).toBe('fallida');
    expect(service.estadoActual()?.ultimoRegistroActivo).toEqual(estadoResponse.ultimoRegistroActivo);
  });

  it('maneja error HTTP al consultar estado', async () => {
    apiMock.obtenerEstado.mockReturnValueOnce(throwError(() => ({ status: 500 })));

    await service.consultarEstado(1);

    expect(service.estadoActual()).toBeNull();
    expect(service.error()).toBe('reproduccion.fecundacion.estado.errors.loadState');
  });

  it('aplica la regla de disponibilidad para nueva fecundacion', () => {
    expect(service.esDisponibleParaNuevaFecundacion('fallida')).toBe(true);
    expect(service.esDisponibleParaNuevaFecundacion('sin_estado')).toBe(true);
    expect(service.esDisponibleParaNuevaFecundacion('pendiente')).toBe(false);
    expect(service.esDisponibleParaNuevaFecundacion('en_proceso')).toBe(false);
    expect(service.esDisponibleParaNuevaFecundacion('confirmada')).toBe(false);
    expect(service.esDisponibleParaNuevaFecundacion('en_gestacion')).toBe(false);
  });
});
