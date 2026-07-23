import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { Triaje } from '@modules/sanidad/domain/models/triaje.model';
import { ReporteListadoGeneral } from './reporte-listado-general';

describe('ReporteListadoGeneral', () => {
  let component: ReporteListadoGeneral;
  let fixture: ComponentFixture<ReporteListadoGeneral>;
  let facade: any;
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
      filtros: vi.fn(() => ({ fechaInicio: '2026-07-01', fechaFin: '2026-07-31' })),
      actualizarFiltros: vi.fn(),
      cargarPagina: vi.fn(),
      cambiarLimite: vi.fn(),
      descargar: vi.fn(() => of(new Blob(['file']))),
    };
    filtroService = { actualizarRango: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReporteListadoGeneral],
      providers: [
        { provide: TriajeFacade, useValue: facade },
        { provide: ReporteFiltroService, useValue: filtroService },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ desde: '2026-07-01', hasta: '2026-07-31' }) } },
        },
      ],
    })
      .overrideComponent(ReporteListadoGeneral, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ReporteListadoGeneral);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inicializa filtros desde query params y carga primera pagina', () => {
    component.ngOnInit();

    expect(facade.actualizarFiltros).toHaveBeenCalledWith({
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-31',
    });
    expect(facade.cargarPagina).toHaveBeenCalledWith(1);
  });

  it('preserva filtros de fecha al filtrar columnas', () => {
    component.onColumnFilter({ codigo: 'TRI' });

    expect(facade.actualizarFiltros).toHaveBeenCalledWith({
      codigo: 'TRI',
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-31',
    });
  });

  it('actualiza rango de fechas y filtros', () => {
    component.onDateRangeChange({ start: new Date(2026, 6, 1), end: new Date(2026, 6, 31) });

    expect(filtroService.actualizarRango).toHaveBeenCalledWith('2026-07-01', '2026-07-31');
    expect(facade.actualizarFiltros).toHaveBeenCalledWith({
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-31',
    });
  });

  it('descarga Excel creando un link temporal', () => {
    const createUrl = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:url');
    const revokeUrl = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.fn();
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    component.onDownloadFormat('excel');

    expect(facade.descargar).toHaveBeenCalledWith('excel');
    expect(createUrl).toHaveBeenCalled();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeUrl).toHaveBeenCalledWith('blob:url');
  });

  it('abre PDF en nueva pestana', () => {
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:pdf');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    component.onDownloadFormat('pdf');

    expect(facade.descargar).toHaveBeenCalledWith('pdf');
    expect(open).toHaveBeenCalledWith('blob:pdf', '_blank');
  });

  it('muestra alerta traducida cuando falla descarga', () => {
    facade.descargar.mockReturnValueOnce(throwError(() => new Error('boom')));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    component.onDownloadFormat('excel');

    expect(alertSpy).toHaveBeenCalledWith('sanidad.reportes.download.error');
    expect(component.downloading()).toBe(false);
  });
});
