import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { TriajeService } from '@modules/sanidad/infrastructure/services/triaje.service';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { TriajeHistorialItem } from '@modules/sanidad/domain/models/triaje.model';
import { ReporteGraficoListadoGeneral } from './reporte-listado-grafico-general';

describe('ReporteGraficoListadoGeneral', () => {
  let component: ReporteGraficoListadoGeneral;
  let fixture: ComponentFixture<ReporteGraficoListadoGeneral>;
  let queryParams: Subject<Record<string, string>>;
  let triajeService: any;
  let router: { navigate: ReturnType<typeof vi.fn> };

  const historial: TriajeHistorialItem[] = [
    { id: 1, fechaHora: '2026-07-22T10:30:00', pesoKg: 120, tipoPesoCode: 'CONTROL' },
  ];

  beforeEach(async () => {
    queryParams = new Subject<Record<string, string>>();
    triajeService = {
      getHistorialGeneral: vi.fn(() => of(historial)),
      downloadExcel: vi.fn(() => of(new Blob(['excel']))),
    };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReporteGraficoListadoGeneral],
      providers: [
        { provide: TriajeService, useValue: triajeService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { queryParams } },
        { provide: ReporteFiltroService, useValue: { fechaDesde: vi.fn(), fechaHasta: vi.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string, params?: any) => params ? `${key}:${JSON.stringify(params)}` : key } },
      ],
    })
      .overrideComponent(ReporteGraficoListadoGeneral, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ReporteGraficoListadoGeneral);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('carga historial general desde query params', () => {
    component.ngOnInit();
    queryParams.next({ desde: '2026-07-01', hasta: '2026-07-31' });

    expect(triajeService.getHistorialGeneral).toHaveBeenCalledWith('2026-07-01', '2026-07-31');
    expect(component.historial()).toEqual(historial);
    expect(component.loading()).toBe(false);
  });

  it('apaga loading cuando falla carga de historial', () => {
    triajeService.getHistorialGeneral.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.loadData('2026-07-01', '2026-07-31');

    expect(component.loading()).toBe(false);
  });

  it('arma chartData con labels y pesos', () => {
    component.historial.set(historial);

    const data = component.chartData();

    expect(data.labels).toHaveLength(1);
    expect(data.datasets[0].data).toEqual([120]);
  });

  it('actualiza query params al cambiar rango', () => {
    component.onDateRangeChange({ start: new Date(2026, 6, 1), end: new Date(2026, 6, 31) });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { desde: '2026-07-01', hasta: '2026-07-31' },
      queryParamsHandling: 'merge',
    });
  });

  it('descarga Excel del grafico general', () => {
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:excel');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    component.fixedDateRange.set({ desde: '2026-07-01', hasta: '2026-07-31' });

    component.onDownloadFormat('excel');

    expect(triajeService.downloadExcel).toHaveBeenCalledWith({ fechaDesde: '2026-07-01', fechaHasta: '2026-07-31' });
    expect(click).toHaveBeenCalledOnce();
    expect(component.loading()).toBe(false);
  });

  it('muestra alerta si el PDF se solicita antes de que el chart exista', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    component.onDownloadFormat('pdf');

    expect(alertSpy).toHaveBeenCalledWith('sanidad.reportes.charts.pdfNotReady');
  });
});
