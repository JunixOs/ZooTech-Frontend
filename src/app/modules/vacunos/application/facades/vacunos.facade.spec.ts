import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VacunoService } from '../../infrastructure/services/vacunos.service';
import { VacunosFacade } from './vacunos.facade';

describe('VacunosFacade', () => {
  let facade: VacunosFacade;
  let repository: {
    getAll: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repository = {
      getAll: vi.fn(() => of({
        items: [
          {
            id: 1,
            codigo: 'VAC-001',
            nombre: 'Luna',
            fechaNacimiento: '2025-01-01',
            raza: 'HOLSTEIN',
            sexo: 'HEMBRA',
            distrito: 'Lima',
            estado: 'vivo',
          },
        ],
        totalItems: 1,
        paginaActual: 1,
        totalPaginas: 1,
        limitePorPagina: 10,
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        VacunosFacade,
        { provide: VacunoService, useValue: repository },
      ],
    });

    facade = TestBed.inject(VacunosFacade);
  });

  it('carga pagina y actualiza las señales de listado', () => {
    facade.cargarPagina(1);

    expect(repository.getAll).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
    });
    expect(facade.vacunos()).toHaveLength(1);
    expect(facade.totalItems()).toBe(1);
    expect(facade.cargando()).toBe(false);
    expect(facade.error()).toBeNull();
  });

  it('adapta los parametros de tabla al contrato del listado', () => {
    facade.cargarListado({
      search: 'Luna',
      page: 2,
      pageSize: 25,
      fechaInicio: '2026-01-01',
      fechaFin: '2026-01-31',
      estado: 'vivo',
    }).subscribe((result) => {
      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });

    expect(repository.getAll).toHaveBeenCalledWith({
      search: 'Luna',
      page: 2,
      pageSize: 25,
      fechaDesde: '2026-01-01',
      fechaHasta: '2026-01-31',
      estado: 'vivo',
    });
  });

  it('expone el mensaje de una respuesta de listado rechazada', () => {
    repository.getAll.mockReturnValueOnce(throwError(() => new Error('No se pudo listar vacunos.')));

    facade.cargarListado({ search: '', page: 1, pageSize: 10 }).subscribe({ error: () => undefined });

    expect(facade.error()).toBe('No se pudo listar vacunos.');
    expect(facade.cargando()).toBe(false);
  });
});
