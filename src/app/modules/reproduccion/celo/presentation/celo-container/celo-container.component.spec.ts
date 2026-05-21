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

const mockCeloApiService = {
  listarCelos: () => of(MOCK_DATA),
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
      expect(component.columns[0].filterable).toBe(true);
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
  });

  describe('paginación inicial', () => {
    it('debe empezar en página 1', () => {
      expect(component.currentPage()).toBe(1);
    });

    it('debe tener pageSize 10', () => {
      expect(component.pageSize()).toBe(10);
    });

    it('debe tener 12 registros mock', () => {
      expect(component.totalItems()).toBe(12);
    });
  });

  describe('filteredData', () => {
    it('debe devolver todos los datos sin filtros', () => {
      expect(component.filteredData().length).toBe(12);
    });

    it('debe filtrar por rango de fechas (start)', () => {
      const range: DateRange = { start: new Date('2026-05-10'), end: null };
      component.onDateRangeChange(range);
      component.onApplyFilters();
      fixture.detectChanges();

      const filtered = component.filteredData();
      // Hay registros desde 2026-04-28, así que debería filtrar
      expect(filtered.length).toBeLessThan(12);
      for (const r of filtered) {
        expect(new Date(r.fecha).getTime()).toBeGreaterThanOrEqual(
          new Date('2026-05-10').getTime(),
        );
      }
    });

    it('debe filtrar por rango de fechas (end)', () => {
      const range: DateRange = { start: null, end: new Date('2026-05-01') };
      component.onDateRangeChange(range);
      component.onApplyFilters();
      fixture.detectChanges();

      const filtered = component.filteredData();
      for (const r of filtered) {
        expect(new Date(r.fecha).getTime()).toBeLessThanOrEqual(
          new Date('2026-05-01T23:59:59.999').getTime(),
        );
      }
    });

    it('debe filtrar por rango completo (start y end)', () => {
      const range: DateRange = {
        start: new Date('2026-05-10'),
        end: new Date('2026-05-12'),
      };
      component.onDateRangeChange(range);
      component.onApplyFilters();
      fixture.detectChanges();

      const filtered = component.filteredData();
      for (const r of filtered) {
        expect(new Date(r.fecha).getTime()).toBeGreaterThanOrEqual(
          new Date('2026-05-10').getTime(),
        );
        expect(new Date(r.fecha).getTime()).toBeLessThanOrEqual(
          new Date('2026-05-12T23:59:59.999').getTime(),
        );
      }
    });

    it('debe filtrar por filtros de columna individuales', () => {
      component.onColumnFilter({ nombreVacuno: 'Luna' });
      fixture.detectChanges();

      const filtered = component.filteredData();
      expect(filtered.length).toBe(3); // Luna tiene 3 registros en mock data
      for (const r of filtered) {
        expect(r.nombreVacuno).toBe('Luna');
      }
    });
  });

  describe('paginatedData', () => {
    it('debe devolver máximo pageSize registros', () => {
      expect(component.paginatedData().length).toBeLessThanOrEqual(component.pageSize());
    });

    it('debe resetear a página 1 al cambiar rango de fechas', () => {
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
      expect(component.filteredData().length).toBeLessThan(12);

      component.onDateRangeChange({ start: null, end: null });
      fixture.detectChanges();
      expect(component.filteredData().length).toBe(12);
    });
  });

  describe('template', () => {
    it('debe renderizar el título (usa pipe translate)', () => {
      const el = fixture.nativeElement.textContent;
      expect(el).toContain('reproduccion.celo.title');
    });

    it('debe renderizar el breadcrumb con keys i18n', () => {
      const el = fixture.nativeElement.textContent;
      expect(el).toContain('sidebar.reproduccion');
      expect(el).toContain('sidebar.celo');
    });

    it('debe renderizar el botón "Vacas en Celo" con el enlace correcto', () => {
      const btn = fixture.nativeElement.querySelector('a.header-btn');
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('routerLink') || btn.getAttribute('href')).toContain('/reproduccion/celo/vacas');
      expect(btn.textContent).toContain('reproduccion.celo.actions.viewVacas');
    });

    it('debe tener botón de búsqueda', () => {
      const btn = fixture.nativeElement.querySelector('button[title]');
      expect(btn).toBeTruthy();
    });
  });
});
