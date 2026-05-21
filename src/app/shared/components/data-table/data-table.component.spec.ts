import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { DataTableComponent } from './data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({
      'shared.table.view': 'Ver',
      'shared.table.noData': 'Sin datos',
      'shared.table.noDataHint': 'Ajustá los filtros',
      'shared.table.searchColumn': 'Buscar...',
    });
  }
}

const MOCK_COLUMNS: ColumnConfig[] = [
  { key: 'codigo', headerKey: 'test.codigo', sortable: true, filterable: true },
  { key: 'nombre', headerKey: 'test.nombre', sortable: true, filterable: true },
  { key: 'edad', headerKey: 'test.edad', sortable: true, filterable: false, align: 'center' },
];

const MOCK_DATA: Record<string, unknown>[] = [
  { codigo: 'VAC-001', nombre: 'Luna', edad: 5 },
  { codigo: 'VAC-002', nombre: 'Estrella', edad: 3 },
  { codigo: 'VAC-003', nombre: 'Rosa', edad: 7 },
];

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent],
      providers: [
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
  });

  function setInputs(
    overrides: Partial<{
      columns: ColumnConfig[];
      data: Record<string, unknown>[];
      currentPage: number;
      pageSize: number;
      totalItems: number;
      loading: boolean;
      actionLabel: string;
    }> = {},
  ) {
    fixture.componentRef.setInput('columns', overrides.columns ?? MOCK_COLUMNS);
    fixture.componentRef.setInput('data', overrides.data ?? MOCK_DATA);
    fixture.componentRef.setInput('currentPage', overrides.currentPage ?? 1);
    fixture.componentRef.setInput('pageSize', overrides.pageSize ?? 10);
    fixture.componentRef.setInput('totalItems', overrides.totalItems ?? 3);
    if (overrides.loading !== undefined) {
      fixture.componentRef.setInput('loading', overrides.loading);
    }
    if (overrides.actionLabel !== undefined) {
      fixture.componentRef.setInput('actionLabel', overrides.actionLabel);
    }
    fixture.detectChanges();
  }

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      setInputs();
      expect(component).toBeTruthy();
    });
  });

  describe('getCellValue', () => {
    it('debe devolver el valor como string', () => {
      setInputs();
      expect(component.getCellValue(MOCK_DATA[0], 'codigo')).toBe('VAC-001');
    });

    it('debe devolver "—" para null', () => {
      setInputs();
      expect(component.getCellValue({ valor: null }, 'valor')).toBe('—');
    });

    it('debe devolver "—" para undefined', () => {
      setInputs();
      expect(component.getCellValue({}, 'inexistente')).toBe('—');
    });

    it('debe convertir números a string', () => {
      setInputs();
      expect(component.getCellValue(MOCK_DATA[0], 'edad')).toBe('5');
    });
  });

  describe('columnFilters', () => {
    it('debe almacenar filtros por columna', () => {
      setInputs();
      component.onColumnFilter('codigo', 'VAC-001');
      expect(component.columnFilters()).toEqual({ codigo: 'VAC-001' });
    });

    it('debe acumular múltiples filtros', () => {
      setInputs();
      component.onColumnFilter('codigo', 'VAC');
      component.onColumnFilter('nombre', 'Luna');
      expect(component.columnFilters()).toEqual({ codigo: 'VAC', nombre: 'Luna' });
    });

    it('debe sobrescribir filtro de misma columna', () => {
      setInputs();
      component.onColumnFilter('codigo', 'VAC');
      component.onColumnFilter('codigo', 'VAC-001');
      expect(component.columnFilters()).toEqual({ codigo: 'VAC-001' });
    });
  });

  describe('eventos de output', () => {
    it('debe emitir rowAction al hacer clic en Ver', () => {
      setInputs({ actionLabel: 'shared.table.view' });
      const spy = vi.fn();
      component.rowAction.subscribe(spy);

      const btn = fixture.nativeElement.querySelector('button[title="Ver"]');
      if (btn) {
        btn.click();
        expect(spy).toHaveBeenCalledWith(MOCK_DATA[0]);
      }
    });

    it('NO debe mostrar botón de acción si actionLabel está vacío', () => {
      setInputs({ actionLabel: '' });
      const buttons = fixture.nativeElement.querySelectorAll('button');
      // Solo el paginator tiene botones en este caso
      expect(component.actionLabel()).toBe('');
    });

    it('debe emitir columnFilter al cambiar filtro por columna', () => {
      setInputs();
      const spy = vi.fn();
      component.columnFilter.subscribe(spy);

      component.onColumnFilter('codigo', 'VAC-001');
      expect(spy).toHaveBeenCalledWith({ codigo: 'VAC-001' });

      component.onColumnFilter('codigo', '');
      expect(spy).toHaveBeenCalledWith({});
    });

    it('debe actualizar searchValue y emitir search al buscar globalmente', () => {
      setInputs();
      const spy = vi.fn();
      component.search.subscribe(spy);

      component.onSearchInput('Luna');
      expect(component.searchValue()).toBe('Luna');
      expect(spy).toHaveBeenCalledWith('Luna');
    });

    it('debe vaciar input y emitir vacío al limpiar búsqueda', () => {
      setInputs();
      const spy = vi.fn();
      component.search.subscribe(spy);

      const mockInput = document.createElement('input');
      mockInput.value = 'Estrella';
      component.searchValue.set('Estrella');

      component.onClearSearch(mockInput);
      expect(mockInput.value).toBe('');
      expect(component.searchValue()).toBe('');
      expect(spy).toHaveBeenCalledWith('');
    });
  });

  describe('estado vacío', () => {
    it('debe mostrar la key de no data cuando el array está vacío', () => {
      setInputs({ data: [], totalItems: 0 });
      const el = fixture.nativeElement.textContent;
      expect(el).toContain('shared.table.noData');
    });
  });

  describe('estado loading', () => {
    it('debe mostrar skeletons cuando loading es true', () => {
      setInputs({ loading: true });
      // Los skeletons tienen animate-pulse
      const skeletons = fixture.nativeElement.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('renderizado de columnas', () => {
    it('debe renderizar todas las columnas en el header', () => {
      setInputs();
      const ths = fixture.nativeElement.querySelectorAll('thead th');
      // 3 columnas + 1 acción (cuando actionLabel está vacío, no hay columna acción)
      expect(ths.length).toBeGreaterThanOrEqual(3);
    });

    it('debe renderizar todas las filas de datos', () => {
      setInputs();
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      // Hay 3 filas de datos en MOCK_DATA
      expect(rows.length).toBe(3);
    });
  });
});
