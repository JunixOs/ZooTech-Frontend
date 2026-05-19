import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { CeloContainerComponent } from './celo-container.component';
import { DateRange } from '@shared/models/report-config.model';

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

describe('CeloContainerComponent', () => {
  let component: CeloContainerComponent;
  let fixture: ComponentFixture<CeloContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CeloContainerComponent],
      providers: [
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

  describe('template', () => {
    it('debe renderizar el título (usa pipe translate)', () => {
      const el = fixture.nativeElement.textContent;
      expect(el).toContain('reproduccion.celo.title');
    });

    it('debe renderizar el breadcrumb con keys i18n', () => {
      const el = fixture.nativeElement.textContent;
      expect(el).toContain('common.brandShort');
      expect(el).toContain('sidebar.reproduccion');
      expect(el).toContain('sidebar.celo');
    });

    it('debe tener botón de acción principal', () => {
      const el = fixture.nativeElement.textContent;
      expect(el).toContain('reproduccion.celo.actions.viewVacas');
    });
  });
});
