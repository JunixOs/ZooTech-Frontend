import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FecundacionService } from '../../infrastructure/services/fecundacion.service';
import { FecundacionFacade } from './fecundacion.facade';

describe('FecundacionFacade', () => {
  let facade: FecundacionFacade;
  let repository: {
    listarFecundaciones: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repository = {
      listarFecundaciones: vi.fn(() => of({
        data: [
          {
            id: 1,
            codigoFecundacion: 'FEC-001',
            fechaProcedimiento: '2026-01-01',
            nombreVacunoReceptor: 'Luna',
            responsable: 'Vet',
            tipoFecundacion: 'IA',
            codigoResultado: 'EXITOSA',
            nombreDonante: 'Toro A',
          },
        ],
        page: 1,
        pageSize: 10,
        limit: 10,
        totalCount: 1,
        success: true,
        errorMessage: null,
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        FecundacionFacade,
        { provide: FecundacionService, useValue: repository },
      ],
    });

    facade = TestBed.inject(FecundacionFacade);
  });

  it('carga pagina y actualiza las señales del listado', () => {
    facade.cargarPagina(1);

    expect(repository.listarFecundaciones).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
    });
    expect(facade.fecundaciones()).toHaveLength(1);
    expect(facade.totalItems()).toBe(1);
    expect(facade.cargando()).toBe(false);
    expect(facade.error()).toBeNull();
  });
});
