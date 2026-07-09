import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { vi } from 'vitest';

import { ReporteCeloVacunoComponent } from './reporte-celo-vacuno.component';
import { CeloFacade } from '../../../application/celo.facade';
import { ReporteCeloPorVacuno } from '../../../domain/models/reporte-celo-vacuno.model';

describe('ReporteCeloVacunoComponent', () => {
  let component: ReporteCeloVacunoComponent;
  let fixture: ComponentFixture<ReporteCeloVacunoComponent>;
  let router: Router;

  let reporteSignal: ReturnType<typeof signal<ReporteCeloPorVacuno[]>>;

  const mockReporteCeloPorVacuno: ReporteCeloPorVacuno[] = [
    {
      codigoVacuno: 'VAC-001',
      nombre: 'Luna',
      ultimoCelo: '2026-07-01',
      vecesEnCelo: 3,
    },
    {
      codigoVacuno: 'VAC-002',
      nombre: 'Estrella',
      ultimoCelo: '2026-07-02',
      vecesEnCelo: 1,
    },
    {
      codigoVacuno: 'VAC-003',
      nombre: 'Canela',
      ultimoCelo: '2026-07-03',
      vecesEnCelo: 2,
    },
  ];

  let celoFacadeMock: {
    reporteCeloPorVacuno: ReturnType<typeof signal<ReporteCeloPorVacuno[]>>;
    isLoading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    cargarReporteCeloPorVacuno: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    reporteSignal = signal(mockReporteCeloPorVacuno);

    celoFacadeMock = {
      reporteCeloPorVacuno: reporteSignal,
      isLoading: signal(false),
      error: signal(null),
      cargarReporteCeloPorVacuno: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReporteCeloVacunoComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        {
          provide: CeloFacade,
          useValue: celoFacadeMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteCeloVacunoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('carga inicial', () => {
    it('debe cargar el reporte de celo por vacuno al iniciar', () => {
      expect(celoFacadeMock.cargarReporteCeloPorVacuno).toHaveBeenCalledTimes(1);
    });
  });

  describe('columnas', () => {
    it('debe tener 4 columnas definidas', () => {
      expect(component.columns.length).toBe(4);
    });

    it('la primera columna debe ser codigoVacuno', () => {
      expect(component.columns[0].key).toBe('codigoVacuno');
    });

    it('la última columna debe ser vecesEnCelo sin filtro', () => {
      const ultimaColumna = component.columns[component.columns.length - 1];

      expect(ultimaColumna.key).toBe('vecesEnCelo');
      expect(ultimaColumna.filterable).toBe(false);
    });

    it('todas las columnas deben tener headerKey', () => {
      const todasTienenHeaderKey = component.columns.every(
        column => !!column.headerKey,
      );

      expect(todasTienenHeaderKey).toBe(true);
    });
  });

  describe('datos del reporte', () => {
    it('debe obtener los datos desde el facade mediante filteredData', () => {
      expect(component.filteredData()).toEqual(mockReporteCeloPorVacuno);
    });

    it('debe calcular el total de registros', () => {
      expect(component.totalItems()).toBe(3);
    });

    it('debe mapear los datos paginados para la tabla', () => {
      expect(component.paginatedData()).toEqual([
        {
          codigoVacuno: 'VAC-001',
          nombre: 'Luna',
          ultimoCelo: '2026-07-01',
          vecesEnCelo: 3,
        },
        {
          codigoVacuno: 'VAC-002',
          nombre: 'Estrella',
          ultimoCelo: '2026-07-02',
          vecesEnCelo: 1,
        },
        {
          codigoVacuno: 'VAC-003',
          nombre: 'Canela',
          ultimoCelo: '2026-07-03',
          vecesEnCelo: 2,
        },
      ]);
    });
  });

  describe('búsqueda general', () => {
    it('debe filtrar por término de búsqueda', () => {
      component.onSearch('luna');

      expect(component.filteredData()).toEqual([
        mockReporteCeloPorVacuno[0],
      ]);
    });

    it('debe reiniciar la página al buscar', () => {
      component.onPageChange(2);

      component.onSearch('luna');

      expect(component.currentPage()).toBe(1);
    });
  });

  describe('filtros por columna', () => {
    it('debe filtrar por codigoVacuno', () => {
      component.onColumnFilter({
        codigoVacuno: 'VAC-002',
      });

      expect(component.filteredData()).toEqual([
        mockReporteCeloPorVacuno[1],
      ]);
    });

    it('debe filtrar por nombre', () => {
      component.onColumnFilter({
        nombre: 'canela',
      });

      expect(component.filteredData()).toEqual([
        mockReporteCeloPorVacuno[2],
      ]);
    });

    it('debe reiniciar la página al aplicar filtros por columna', () => {
      component.onPageChange(2);

      component.onColumnFilter({
        nombre: 'luna',
      });

      expect(component.currentPage()).toBe(1);
    });
  });

  describe('paginación', () => {
    it('debe iniciar en página 1', () => {
      expect(component.currentPage()).toBe(1);
    });

    it('debe iniciar con tamaño de página 10', () => {
      expect(component.pageSize()).toBe(10);
    });

    it('debe cambiar de página', () => {
      component.onPageChange(2);

      expect(component.currentPage()).toBe(2);
    });

    it('debe cambiar el tamaño de página y regresar a página 1', () => {
      component.onPageChange(2);

      component.onPageSizeChange(25);

      expect(component.pageSize()).toBe(25);
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('filtro por fecha', () => {
    it('debe aplicar filtros y volver a cargar el reporte', () => {
      vi.clearAllMocks();

      component.onDateRangeChange({
        start: new Date('2026-07-01'),
        end: new Date('2026-07-31'),
      });

      component.onApplyFilters();

      expect(component.currentPage()).toBe(1);
      expect(celoFacadeMock.cargarReporteCeloPorVacuno).toHaveBeenCalledTimes(1);
    });

    it('debe reiniciar la página cuando se limpia el rango de fechas', () => {
      component.onPageChange(2);

      component.onDateRangeChange({
        start: null,
        end: null,
      });

      expect(component.currentPage()).toBe(1);
    });
  });

  describe('navegación al detalle', () => {
    it('debe navegar al detalle del vacuno', () => {
      const navigateSpy = vi
        .spyOn(router, 'navigate')
        .mockResolvedValue(true);

      component.verDetalle({
        codigoVacuno: 'VAC-001',
        nombre: 'Luna',
      });

      expect(navigateSpy).toHaveBeenCalledWith(
        [
          '/reproduccion/celo/reportes/reporte-celo-vacuno',
          'VAC-001',
        ],
        {
          queryParams: {
            nombre: 'Luna',
          },
        },
      );
    });

    it('no debe navegar si no existe codigoVacuno', () => {
      const navigateSpy = vi
        .spyOn(router, 'navigate')
        .mockResolvedValue(true);

      component.verDetalle({
        nombre: 'Luna',
      });

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});
