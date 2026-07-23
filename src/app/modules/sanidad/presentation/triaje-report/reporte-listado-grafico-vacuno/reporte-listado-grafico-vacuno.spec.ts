import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { TriajeService } from '@modules/sanidad/infrastructure/services/triaje.service';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { TriajeHistorialItem } from '@modules/sanidad/domain/models/triaje.model';
import { ReporteListadoGraficoVacuno } from './reporte-listado-grafico-vacuno';

describe('ReporteListadoGraficoVacuno', () => {
  let component: ReporteListadoGraficoVacuno;
  let fixture: ComponentFixture<ReporteListadoGraficoVacuno>;
  let paramMap: Subject<ReturnType<typeof convertToParamMap>>;
  let queryParams: Subject<Record<string, string>>;
  let triajeService: any;
  let router: { navigate: ReturnType<typeof vi.fn> };

  const historial: TriajeHistorialItem[] = [
    { id: 1, fechaHora: '2026-07-22T10:30:00', pesoKg: 120, tipoPesoCode: 'CONTROL' },
  ];

  beforeEach(async () => {
    paramMap = new Subject<ReturnType<typeof convertToParamMap>>();
    queryParams = new Subject<Record<string, string>>();
    triajeService = {
      getVacunos: vi.fn(() => of([{ id: 5, codigo: 'VAC-005', nombre: 'Luna' }])),
      getHistorialByVacunoId: vi.fn(() => of(historial)),
      downloadExcel: vi.fn(() => of(new Blob(['excel']))),
    };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReporteListadoGraficoVacuno],
      providers: [
        { provide: TriajeService, useValue: triajeService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { paramMap, queryParams } },
        { provide: ReporteFiltroService, useValue: { fechaDesde: vi.fn(), fechaHasta: vi.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string, params?: any) => params ? `${key}:${JSON.stringify(params)}` : key } },
      ],
    })
      .overrideComponent(ReporteListadoGraficoVacuno, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ReporteListadoGraficoVacuno);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('carga vacunos y muestra titulo con codigo y nombre', () => {
    component.ngOnInit();

    expect(triajeService.getVacunos).toHaveBeenCalledOnce();
    expect(component.vacunos()).toEqual([{ id: 5, codigo: 'VAC-005', nombre: 'Luna' }]);
    component.vacunoId.set(5);
    expect(component.pageTitle()).toBe('VAC-005 - LUNA');
  });

  it('usa titulo de carga cuando no encuentra vacuno', () => {
    expect(component.pageTitle()).toBe('sanidad.reportes.charts.loadingTitle');
  });

  it('lee id de ruta y carga historial con fechas', () => {
    component.ngOnInit();
    queryParams.next({ desde: '2026-07-01', hasta: '2026-07-31' });
    paramMap.next(convertToParamMap({ id: '5' }));

    expect(component.vacunoId()).toBe(5);
    expect(triajeService.getHistorialByVacunoId).toHaveBeenCalledWith(5, '2026-07-01', '2026-07-31');
    expect(component.historial()).toEqual(historial);
  });

  it('apaga loading cuando falla cargar historial', () => {
    triajeService.getHistorialByVacunoId.mockReturnValueOnce(throwError(() => new Error('boom')));
    component.vacunoId.set(5);

    component.loadData('2026-07-01', '2026-07-31');

    expect(component.loading()).toBe(false);
  });

  it('navega al cambiar vacuno seleccionado', () => {
    const select = document.createElement('select');
    Object.defineProperty(select, 'value', { value: '7' });

    component.onVacunoChange({ target: select } as unknown as Event);

    expect(router.navigate).toHaveBeenCalledWith(['/sanidad/reportes/graficoListadoVacuno', '7'], {
      queryParamsHandling: 'preserve',
    });
  });

  it('actualiza query params al cambiar rango', () => {
    component.onDateRangeChange({ start: new Date(2026, 6, 1), end: new Date(2026, 6, 31) });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { desde: '2026-07-01', hasta: '2026-07-31' },
      queryParamsHandling: 'merge',
    });
  });

  it('descarga Excel por vacuno', () => {
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:excel');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    component.vacunoId.set(5);
    component.fixedDateRange.set({ desde: '2026-07-01', hasta: '2026-07-31' });

    component.onDownloadFormat('excel');

    expect(triajeService.downloadExcel).toHaveBeenCalledWith({
      fechaDesde: '2026-07-01',
      fechaHasta: '2026-07-31',
      vacunoId: '5',
    });
    expect(click).toHaveBeenCalledOnce();
  });

  it('muestra alerta si el PDF se solicita antes de que el chart exista', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    component.onDownloadFormat('pdf');

    expect(alertSpy).toHaveBeenCalledWith('sanidad.reportes.charts.pdfNotReady');
  });
});
