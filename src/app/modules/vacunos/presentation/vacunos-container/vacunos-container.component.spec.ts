import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VacunosFacade } from '../../application/vacunos.facade';
import { VacunosContainerComponent } from './vacunos-container.component';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, unknown>> {
    return of({
      vacunos: {
        listado: {
          title: 'Listado de Vacunos',
          breadcrumb: 'Vacunos',
          home: 'Inicio',
          deleted: 'Vacuno {{codigo}} eliminado correctamente.',
          updated: 'Vacuno {{codigo}} actualizado correctamente.',
          cancelled: 'Eliminacion de vacuno {{codigo}} cancelada correctamente.',
          filters: { dateRange: 'Rango de fechas' },
          columns: {
            codigo: 'Codigo',
            fecha: 'Fecha',
            nombre: 'Nombre',
            raza: 'Raza',
            procedencia: 'Procedencia',
            estado: 'Estado',
          },
          actions: { view: 'VER' },
        },
      },
      shared: {
        table: {
          rowsPerPagePrefix: 'Mostrar',
          rowsPerPageSuffix: 'registros',
          noData: 'Sin datos',
          noDataHint: 'No hay registros',
          showing: 'Mostrando {{start}} - {{end}} de {{total}}',
          searchColumn: 'Buscar',
        },
        search: { default: 'Buscar' },
        actions: { search: 'Buscar' },
        filters: { all: 'Todos' },
      },
    });
  }
}

describe('VacunosContainerComponent', () => {
  let component: VacunosContainerComponent;
  const facade = {
    vacunos: signal([]),
    cargando: signal(false),
    error: signal(null),
    paginaActual: signal(1),
    limitePorPagina: signal(10),
    totalItems: signal(0),
    cargarPagina: vi.fn(),
    actualizarBusqueda: vi.fn(),
    actualizarEstado: vi.fn(),
    actualizarFechas: vi.fn(),
    cambiarLimite: vi.fn(),
  };

  beforeEach(async () => {
    facade.cargarPagina.mockClear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'cancelled' ? 'VAC-001' : null),
              },
            },
          },
        },
        { provide: VacunosFacade, useValue: facade },
      ],
    });

    component = TestBed.runInInjectionContext(() => new VacunosContainerComponent());
    component.ngOnInit();
  });

  it('registra el codigo de cancelacion al volver al listado', () => {
    expect(component.cancelledCodigo()).toBe('VAC-001');
    expect(facade.cargarPagina).toHaveBeenCalledWith(1);
  });
});
