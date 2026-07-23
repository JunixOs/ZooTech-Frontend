import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { ReporteContainer } from './reporte-container';

describe('ReporteContainer', () => {
  let component: ReporteContainer;
  let fixture: ComponentFixture<ReporteContainer>;
  let routerEvents: Subject<NavigationEnd>;
  let router: { url: string; events: Subject<NavigationEnd>; navigate: ReturnType<typeof vi.fn> };
  let filtroService: { actualizarRango: ReturnType<typeof vi.fn>; resetDefault: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    routerEvents = new Subject<NavigationEnd>();
    router = { url: '/sanidad/reportes', events: routerEvents, navigate: vi.fn() };
    filtroService = { actualizarRango: vi.fn(), resetDefault: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReporteContainer],
      providers: [
        { provide: Router, useValue: router },
        { provide: ReporteFiltroService, useValue: filtroService },
      ],
    })
      .overrideComponent(ReporteContainer, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ReporteContainer);
    component = fixture.componentInstance;
  });

  it('genera las cuatro cards de reportes', () => {
    const reports = component.reports();

    expect(reports).toHaveLength(4);
    expect(reports[0].route).toBe('/sanidad/reportes/listadoGeneral');
    expect(reports[1].route).toBe('/sanidad/reportes/graficoListadoGeneral');
    expect(reports[2].route).toBe('/sanidad/reportes/listadoVacuno');
    expect(reports[3].onOpen).toBeTypeOf('function');
  });

  it('card de grafico por vacuno navega con type grafico y rango actual', () => {
    component.onRangeChange({ start: new Date(Date.UTC(2026, 6, 1)), end: new Date(Date.UTC(2026, 6, 31)) });

    component.reports()[3].onOpen?.();

    expect(router.navigate).toHaveBeenCalledWith(['/sanidad/reportes/listadoVacuno'], {
      queryParams: { type: 'grafico', desde: '2026-07-01', hasta: '2026-07-31' },
    });
  });

  it('actualiza rango y lo propaga al servicio', () => {
    component.onRangeChange({ start: new Date(Date.UTC(2026, 6, 1)), end: new Date(Date.UTC(2026, 6, 31)) });

    expect(component.currentDateRange()).toEqual({ desde: '2026-07-01', hasta: '2026-07-31' });
    expect(filtroService.actualizarRango).toHaveBeenCalledWith('2026-07-01', '2026-07-31');
  });

  it('resetea rango por defecto cuando se limpia el rango', () => {
    component.onRangeChange({ start: null, end: null });

    expect(filtroService.resetDefault).toHaveBeenCalledOnce();
  });

  it('detecta rutas hijas con NavigationEnd', () => {
    expect(component.hasChildRoute()).toBe(false);

    routerEvents.next(new NavigationEnd(1, '/sanidad/reportes/listadoGeneral', '/sanidad/reportes/listadoGeneral'));
    expect(component.hasChildRoute()).toBe(true);

    routerEvents.next(new NavigationEnd(2, '/sanidad/reportes', '/sanidad/reportes'));
    expect(component.hasChildRoute()).toBe(false);
  });
});
