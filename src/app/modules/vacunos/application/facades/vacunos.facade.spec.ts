import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VacunoService } from '../../infrastructure/api/vacunos.api.service';
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
});
