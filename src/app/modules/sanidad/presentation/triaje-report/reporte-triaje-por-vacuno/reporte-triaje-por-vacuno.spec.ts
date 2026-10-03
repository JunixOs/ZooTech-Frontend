import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { Triaje } from '@modules/sanidad/domain/models/triaje.model';
import { ReporteTriajePorVacuno } from './reporte-triaje-por-vacuno';

describe('ReporteTriajePorVacuno', () => {
  let component: ReporteTriajePorVacuno;
  let fixture: ComponentFixture<ReporteTriajePorVacuno>;
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
    observaciones: null,
  };

  beforeEach(async () => {
    facade = {
      triajes: vi.fn(() => [triaje]),
      vacunos: vi.fn(() => [{ id: 5, codigo: 'VAC-005', nombre: 'Luna' }]),
      cargarPorVacuno: vi.fn(),
      cargarCatalogos: vi.fn(),
      cargarPagina: vi.fn(),
      cambiarLimite: vi.fn(),
      actualizarFiltros: vi.fn(),
      descargar: vi.fn(() => of(new Blob(['file']))),
    };
    filtroService = { actualizarRango: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReporteTriajePorVacuno],
      providers: [
        { provide: TriajeFacade, useValue: facade },
        { provide: ReporteFiltroService, useValue: filtroService },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } } },
      ],
    })
      .overrideComponent(ReporteTriajePorVacuno, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ReporteTriajePorVacuno);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('carga datos del vacuno al inicializar', () => {
    component.ngOnInit();

    expect(facade.cargarPorVacuno).toHaveBeenCalledWith(5);
    expect(facade.cargarCatalogos).toHaveBeenCalledOnce();
  });

  it('calcula titulo con vacuno o fallback por id', () => {
    expect(component.titulo()).toBe('VAC-005 — Luna');

    fixture.destroy();
    facade.vacunos.mockReturnValueOnce([]);
    fixture = TestBed.createComponent(ReporteTriajePorVacuno);
    component = fixture.componentInstance;

    expect(component.titulo()).toBe('#5');
  });

  it('fuerza vacunoId al filtrar columnas', () => {
    component.onColumnFilter({ codigo: 'TRI' });

    expect(facade.actualizarFiltros).toHaveBeenCalledWith({ codigo: 'TRI', vacunoId: '5' });
  });

  it('actualiza rango y recarga pagina', () => {
    component.onDateRangeChange({ start: new Date(2026, 6, 1), end: new Date(2026, 6, 31) });

    expect(filtroService.actualizarRango).toHaveBeenCalledWith('2026-07-01', '2026-07-31');
    expect(facade.cargarPagina).toHaveBeenCalledWith(1);
  });

  it('descarga Excel y abre PDF', () => {
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:file');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    component.onDownloadFormat('excel');
    component.onDownloadFormat('pdf');

    expect(facade.descargar).toHaveBeenCalledWith('excel');
    expect(facade.descargar).toHaveBeenCalledWith('pdf');
    expect(open).toHaveBeenCalledWith('blob:file', '_blank');
  });

  it('muestra alerta traducida cuando falla descarga', () => {
    facade.descargar.mockReturnValueOnce(throwError(() => new Error('boom')));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    component.onDownloadFormat('excel');

    expect(alertSpy).toHaveBeenCalledWith('sanidad.reportes.download.error');
    expect(component.downloading()).toBe(false);
  });
});
