import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { CeloContainerComponent } from './celo-container.component';
import { DateRange } from '@shared/models/report-config.model';
import { CeloApiService } from '@modules/reproduccion/celo/infrastructure/celo-api.service';
import { CeloRegistro } from '@modules/reproduccion/celo/domain/models/celo.model';
import { provideRouter } from '@angular/router';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({
      'reproduccion.celo.title': 'Listado de Registro de Celo',
      'reproduccion.celo.columns.codigoRegistro': 'Cód. Registro',
      'reproduccion.celo.columns.fecha': 'Fecha',
      'reproduccion.celo.columns.hora': 'Hora',
      'reproduccion.celo.columns.codigoVacuno': 'Código',
      'reproduccion.celo.columns.nombreVacuno': 'Nombre',
      'reproduccion.celo.columns.vecesEnCelo': 'Veces en celo',
      'reproduccion.celo.actions.viewVacas': 'Vacas en Celo',
      'shared.filters.dateRange': 'Filtrar por fecha',
      'shared.table.view': 'Ver',
      'shared.table.noData': 'Sin datos',
      'shared.table.noDataHint': 'Ajustá los filtros',
      'shared.table.rowsPerPage': 'Filas por página',
      'shared.table.showing': 'Mostrando',
      'shared.table.searchColumn': 'Buscar...',
      'common.brandShort': 'ZOO',
      'sidebar.reproduccion': 'REPRODUCCIÓN',
      'sidebar.celo': 'Celo',
    });
  }
}

const MOCK_DATA: CeloRegistro[] = [
  {
    codigoRegistro: 'CEL-001',
    fecha: '2026-05-10',
    hora: '08:30',
    codigoVacuno: 'VAC-005',
    nombreVacuno: 'Luna',
    vecesEnCelo: 3,
  },
  {
    codigoRegistro: 'CEL-002',
    fecha: '2026-05-11',
    hora: '14:15',
    codigoVacuno: 'VAC-008',
    nombreVacuno: 'Estrella',
    vecesEnCelo: 1,
  },
  {
    codigoRegistro: 'CEL-003',
    fecha: '2026-05-12',
    hora: '06:45',
    codigoVacuno: 'VAC-005',
    nombreVacuno: 'Luna',
    vecesEnCelo: 4,
  },
  {
    codigoRegistro: 'CEL-004',
    fecha: '2026-05-12',
    hora: '10:00',
    codigoVacuno: 'VAC-012',
    nombreVacuno: 'Margarita',
    vecesEnCelo: 2,
  },
  {
    codigoRegistro: 'CEL-005',
    fecha: '2026-05-13',
    hora: '16:20',
    codigoVacuno: 'VAC-003',
    nombreVacuno: 'Rosa',
    vecesEnCelo: 5,
  },
  {
    codigoRegistro: 'CEL-006',
    fecha: '2026-05-13',
    hora: '07:10',
    codigoVacuno: 'VAC-008',
    nombreVacuno: 'Estrella',
    vecesEnCelo: 2,
  },
  {
    codigoRegistro: 'CEL-007',
    fecha: '2026-04-28',
    hora: '11:00',
    codigoVacuno: 'VAC-015',
    nombreVacuno: 'Clavel',
    vecesEnCelo: 1,
  },
  {
    codigoRegistro: 'CEL-008',
    fecha: '2026-05-01',
    hora: '09:30',
    codigoVacuno: 'VAC-005',
    nombreVacuno: 'Luna',
    vecesEnCelo: 2,
  },
  {
    codigoRegistro: 'CEL-009',
    fecha: '2026-05-05',
    hora: '15:45',
    codigoVacuno: 'VAC-020',
    nombreVacuno: 'Azucena',
    vecesEnCelo: 1,
  },
  {
    codigoRegistro: 'CEL-010',
    fecha: '2026-05-14',
    hora: '08:00',
    codigoVacuno: 'VAC-012',
    nombreVacuno: 'Margarita',
    vecesEnCelo: 3,
  },
  {
    codigoRegistro: 'CEL-011',
    fecha: '2026-05-08',
    hora: '13:20',
    codigoVacuno: 'VAC-003',
    nombreVacuno: 'Rosa',
    vecesEnCelo: 4,
  },
  {
    codigoRegistro: 'CEL-012',
    fecha: '2026-05-09',
    hora: '17:00',
    codigoVacuno: 'VAC-025',
    nombreVacuno: 'Jazmín',
    vecesEnCelo: 1,
  },
];

// Simula el filtro por rango de fechas que ahora resuelve el backend (ver
// `CeloRepository.GetPagedAsync`), para poder verificar que el componente
// reenvía `fechaInicio`/`fechaFin` correctamente en cada fetch.
const mockCeloApiService = {
  listarCelos: (
    _search?: string,
    _page?: number,
    _pageSize?: number,
    fechaInicio?: string,
    fechaFin?: string,
  ) => {
    let data = MOCK_DATA;

    if (fechaInicio) {
      data = data.filter((r) => r.fecha >= fechaInicio);
    }
    if (fechaFin) {
      data = data.filter((r) => r.fecha <= fechaFin);
    }

    return of({ data, totalCount: data.length });
  },
};

describe('CeloContainerComponent', () => {
  let component: CeloContainerComponent;
  let fixture: ComponentFixture<CeloContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CeloContainerComponent],
      providers: [
        { provide: CeloApiService, useValue: mockCeloApiService },
        provideRouter([]),
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CeloContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe tener 6 columnas definidas', () => {
      expect(component.columns.length).toBe(6);
    });
  });

  describe('columnas', () => {
    it('la primera columna debe ser codigoRegistro', () => {
      expect(component.columns[0].key).toBe('codigoRegistro');
      expect(component.columns[0].sortable).toBe(true);
    });

    it('la última columna debe ser vecesEnCelo sin filtro', () => {
      const last = component.columns[5];
      expect(last.key).toBe('vecesEnCelo');
      expect(last.filterable).toBe(false);
      expect(last.align).toBe('center');
    });

    it('todas las columnas deben tener headerKey', () => {
      for (const col of component.columns) {
        expect(col.headerKey).toBeTruthy();
      }
    });

    // El filtro por columna no tiene soporte en el backend para este
    // endpoint (ver `celo-container.component.ts`), así que la UI de filtro
    // por columna debe quedar oculta: todas las columnas son `filterable: false`.
    it('ninguna columna debe ser filtrable (el filtro por columna está fuera de alcance)', () => {
      for (const col of component.columns) {
        expect(col.filterable).toBe(false);
      }
    });
  });

  describe('paginación inicial (server-side)', () => {
    it('debe empezar en página 1', () => {
      expect(component.currentPage()).toBe(1);
    });

    it('debe tener pageSize por defecto', () => {
      expect(component.pageSize()).toBeGreaterThan(0);
    });

    it('debe tener el totalItems que devuelve el backend (mock)', () => {
      expect(component.totalItems()).toBe(12);
    });
  });

  describe('rango de fechas (resuelto en el servidor)', () => {
    it('debe devolver todos los datos sin filtro de fecha', () => {
      expect(component.data().length).toBe(12);
    });

    it('debe filtrar por rango de fechas (start) reenviando fechaInicio al backend', () => {
      // Se construye con el constructor local (año, mes, día) — igual que lo
      // que emite un date-picker real — para no depender de cómo el runner
      // de tests interpreta un string ISO en UTC vs. hora local.
      const range: DateRange = { start: new Date(2026, 4, 10), end: null };
      component.onDateRangeChange(range);
      component.onApplyFilters();
      fixture.detectChanges();

      const filtered = component.data();
      // Hay registros desde 2026-04-28, así que debería filtrar
      expect(filtered.length).toBeLessThan(12);
      for (const r of filtered) {
        expect((r['fecha'] as string) >= '2026-05-10').toBe(true);
      }
    });

    it('debe filtrar por rango de fechas (end) reenviando fechaFin al backend', () => {
      const range: DateRange = { start: null, end: new Date(2026, 4, 1) };
      component.onDateRangeChange(range);
      component.onApplyFilters();
      fixture.detectChanges();

      const filtered = component.data();
      for (const r of filtered) {
        expect((r['fecha'] as string) <= '2026-05-01').toBe(true);
      }
    });

    it('debe filtrar por rango completo (start y end)', () => {
      const range: DateRange = {
        start: new Date(2026, 4, 10),
        end: new Date(2026, 4, 12),
      };
      component.onDateRangeChange(range);
      component.onApplyFilters();
      fixture.detectChanges();

      const filtered = component.data();
      for (const r of filtered) {
        expect((r['fecha'] as string) >= '2026-05-10').toBe(true);
        expect((r['fecha'] as string) <= '2026-05-12').toBe(true);
      }
    });

    it('debe resetear a página 1 al aplicar un nuevo rango de fechas (fetch server-side)', () => {
      component.onPageChange(2);
      fixture.detectChanges();
      expect(component.currentPage()).toBe(2);

      component.onDateRangeChange({ start: new Date('2026-05-10'), end: null });
      component.onApplyFilters();
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('onPageChange', () => {
    it('debe actualizar currentPage', () => {
      component.onPageChange(2);
      expect(component.currentPage()).toBe(2);
    });
  });

  describe('onPageSizeChange', () => {
    it('debe actualizar pageSize y resetear página', () => {
      component.onPageChange(2);
      component.onPageSizeChange(5);
      expect(component.pageSize()).toBe(5);
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('onViewRow', () => {
    it('debe aceptar una fila sin errores', () => {
      expect(() => component.onViewRow({ codigoRegistro: 'CEL-001' })).not.toThrow();
    });
  });

  describe('onDateRangeChange', () => {
    it('debe aplicar los filtros inmediatamente cuando el rango se limpia (start y end nulos)', () => {
      component.onDateRangeChange({ start: new Date('2026-05-10'), end: null });
      component.onApplyFilters();
      fixture.detectChanges();
      expect(component.data().length).toBeLessThan(12);

      component.onDateRangeChange({ start: null, end: null });
      fixture.detectChanges();
      expect(component.data().length).toBe(12);
    });
  });

  describe('template', () => {
    it('debe renderizar el título (usa pipe translate)', () => {
      const el = fixture.nativeElement.textContent;
      expect(el).toContain('Listado de Registro de Celo');
    });

    it('debe renderizar el breadcrumb con keys i18n', () => {
      const el = fixture.nativeElement.textContent;
      expect(el).toContain('REPRODUCCIÓN');
      expect(el).toContain('Celo');
    });

    it('debe renderizar el botón "Vacas en Celo" con el enlace correcto', () => {
      const btn = fixture.nativeElement.querySelector('a.filter-btn');
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('routerLink') || btn.getAttribute('href')).toContain(
        '/reproduccion/celo/vacas',
      );
      expect(btn.textContent).toContain('Vacas en Celo');
    });

    it('debe tener botón de búsqueda', () => {
      const btn = fixture.nativeElement.querySelector('button[title]');
      expect(btn).toBeTruthy();
    });
  });
});
