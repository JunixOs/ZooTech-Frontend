import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { Triaje } from '@modules/sanidad/domain/models/triaje.model';
import { ReporteListadoVacuno } from './reporte-listado-vacuno';

describe('ReporteListadoVacuno', () => {
  let component: ReporteListadoVacuno;
  let fixture: ComponentFixture<ReporteListadoVacuno>;
  let facade: any;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let route: any;
  let filtroService: any;

  const triaje: Triaje = {
    id: 1,
    codigo: 'TRI-001',
    fechaHora: '2026-07-22T10:30:00',
    vacunoId: 5,
    vacunoNombre: 'Luna',
    tipoPesoCode: 'CONTROL',
    pesoKg: 120,
  };

  beforeEach(async () => {
    facade = {
      triajes: vi.fn(() => [triaje]),
      filtros: vi.fn(() => ({ fechaInicio: '2026-07-01', fechaFin: '2026-07-31', uniqueVacuno: 'true' })),
      actualizarFiltros: vi.fn(),
      cargarPagina: vi.fn(),
      cambiarLimite: vi.fn(),
    };
    router = { navigate: vi.fn() };
    route = { snapshot: { queryParamMap: convertToParamMap({ desde: '2026-07-01', hasta: '2026-07-31' }) } };
    filtroService = {
      fechaDesde: vi.fn(() => '2026-07-01'),
      fechaHasta: vi.fn(() => '2026-07-31'),
      actualizarRango: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReporteListadoVacuno],
      providers: [
        { provide: TriajeFacade, useValue: facade },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: ReporteFiltroService, useValue: filtroService },
      ],
    })
      .overrideComponent(ReporteListadoVacuno, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ReporteListadoVacuno);
    component = fixture.componentInstance;
  });

  it('inicializa filtros con uniqueVacuno y query params', () => {
    component.ngOnInit();

    expect(facade.actualizarFiltros).toHaveBeenCalledWith({
      uniqueVacuno: 'true',
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-31',
    });
    expect(facade.cargarPagina).toHaveBeenCalledWith(1);
  });

  it('usa etiqueta e icono de grafico cuando query type es grafico', () => {
    route.snapshot.queryParamMap = convertToParamMap({ type: 'grafico' });

    expect(component.actionLabel()).toBe('sanidad.table.viewChart');
    expect(component.actionIcon()).toBe('fa-solid fa-chart-line');
  });

  it('navega al detalle del vacuno en modo listado', () => {
    component.onVerTriaje({ _raw: triaje });

    expect(router.navigate).toHaveBeenCalledWith([5], { relativeTo: route });
  });

  it('navega al grafico del vacuno preservando fechas', () => {
    route.snapshot.queryParamMap = convertToParamMap({ type: 'grafico' });

    component.onVerTriaje({ _raw: triaje });

    expect(router.navigate).toHaveBeenCalledWith(['/sanidad/reportes/graficoListadoVacuno', 5], {
      queryParams: { desde: '2026-07-01', hasta: '2026-07-31' },
      queryParamsHandling: 'merge',
    });
  });

  it('preserva filtros de fecha y uniqueVacuno al filtrar columnas', () => {
    component.onColumnFilter({ codigo: 'TRI' });

    expect(facade.actualizarFiltros).toHaveBeenCalledWith({
      codigo: 'TRI',
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-31',
      uniqueVacuno: 'true',
    });
  });

  it('actualiza rango de fechas y filtros', () => {
    component.onDateRangeChange({ start: new Date(2026, 6, 1), end: new Date(2026, 6, 31) });

    expect(filtroService.actualizarRango).toHaveBeenCalledWith('2026-07-01', '2026-07-31');
    expect(facade.actualizarFiltros).toHaveBeenCalledWith({
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-31',
      uniqueVacuno: 'true',
    });
  });
});
