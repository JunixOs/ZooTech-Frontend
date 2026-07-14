import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheRegistro } from '@modules/leche/domain/models/leche.model';
import { ProduccionDiariaReport } from './produccion-diaria-report';

const mockLecheFacade = {
  registros: (): LecheRegistro[] => [],
  loading: () => false,
  cargarRegistros: vi.fn(),
};

const buildRegistro = (overrides: Partial<LecheRegistro> = {}): LecheRegistro => ({
  id: 1,
  codigoRegistro: 'ORD-001',
  fecha: '2026-07-01',
  hora: '08:00',
  vacunoCodigo: 'VAC-001',
  nombreVacuno: 'Estrella',
  litros: 10,
  encargado: 'Juan',
  ...overrides,
});

const mockLecheRepository = {
  getAll: () => of({ items: [], totalItems: 0, paginaActual: 1, totalPaginas: 0, limitePorPagina: 10 }),
  getById: () => of({}),
  create: () => of(undefined),
  deleteById: () => of(undefined),
  updateById: () => of(undefined),
  getVacunos: () => of([]),
  downloadExcel: vi.fn(() => of(new Blob(['excel']))),
  downloadPdf: vi.fn(() => of(new Blob(['pdf']))),
};

describe('ProduccionDiariaReport', () => {
  let component: ProduccionDiariaReport;
  let fixture: ComponentFixture<ProduccionDiariaReport>;
  let router: Router;

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    mockLecheFacade.cargarRegistros.mockClear();
    mockLecheRepository.downloadExcel.mockClear();
    mockLecheRepository.downloadPdf.mockClear();

    await TestBed.configureTestingModule({
      imports: [ProduccionDiariaReport],
      providers: [
        { provide: LecheFacade, useValue: mockLecheFacade },
        { provide: LecheRepository, useValue: mockLecheRepository },
        provideTranslateService({ defaultLanguage: 'es' }),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProduccionDiariaReport);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carga registros al iniciar', () => {
    expect(mockLecheFacade.cargarRegistros).toHaveBeenCalled();
  });

  it('reinicia la pagina al cambiar el rango', () => {
    const start = new Date('2026-07-01');
    const end = new Date('2026-07-05');

    component.currentPage.set(3);

    component.onRangeChange({ start, end });

    expect(component.currentPage()).toBe(1);
    expect(component.dateRange()).toEqual({ start, end });
  });

  it('reinicia la pagina al cambiar el tamano de pagina', () => {
    component.currentPage.set(4);

    component.onPageSizeChange(25);

    expect(component.pageSize()).toBe(25);
    expect(component.currentPage()).toBe(1);
  });

  it('actualiza la pagina actual al cambiar de pagina', () => {
    component.onPageChange(2);

    expect(component.currentPage()).toBe(2);
  });

  it('filtra registros por rango de fechas', () => {
    const registros = [
      buildRegistro({ id: 1, fecha: '2026-07-01' }),
      buildRegistro({ id: 2, fecha: '2026-07-03' }),
      buildRegistro({ id: 3, fecha: '2026-07-06' }),
    ];

    mockLecheFacade.registros = () => registros;
    fixture = TestBed.createComponent(ProduccionDiariaReport);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.onRangeChange({
      start: new Date('2026-07-02'),
      end: new Date('2026-07-05'),
    });

    expect(component.filteredData()).toHaveLength(1);
    expect(component.filteredData()[0].id).toBe(2);
  });

  it('pagina los registros filtrados en tableData', () => {
    const registros = Array.from({ length: 12 }, (_, index) =>
      buildRegistro({
        id: index + 1,
        codigoRegistro: `ORD-${String(index + 1).padStart(3, '0')}`,
        fecha: '2026-07-01',
      }),
    );

    mockLecheFacade.registros = () => registros;
    fixture = TestBed.createComponent(ProduccionDiariaReport);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.onPageSizeChange(5);
    component.onPageChange(2);

    expect(component.tableData()).toHaveLength(5);
    expect(component.tableData()[0]['id']).toBe(6);
    expect(component.tableData()[4]['id']).toBe(10);
  });

  it('filtra registros por columnas y reinicia la pagina', () => {
    const registros = [
      buildRegistro({ id: 1, codigoRegistro: 'ORD-001', nombreVacuno: 'Estrella' }),
      buildRegistro({ id: 2, codigoRegistro: 'ORD-002', nombreVacuno: 'Toro Rey' }),
      buildRegistro({ id: 3, codigoRegistro: 'ORD-003', nombreVacuno: 'Estrella' }),
    ];

    mockLecheFacade.registros = () => registros;
    fixture = TestBed.createComponent(ProduccionDiariaReport);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.currentPage.set(2);
    component.onColumnFilter({ nombreVacuno: 'estrella' });

    expect(component.currentPage()).toBe(1);
    expect(component.filteredData()).toHaveLength(2);
    expect(component.filteredData().every((row) => row.nombreVacuno === 'Estrella')).toBe(true);
  });

  it('calcula totalItems, totalLitrosReal y totalLitrosIdoneo', () => {
    const registros = [
      buildRegistro({ id: 1, fecha: '2026-07-01', litros: 10, litrosIdoneos: 8 }),
      buildRegistro({ id: 2, fecha: '2026-07-02', litros: 12, litrosIdoneos: 9 }),
      buildRegistro({ id: 3, fecha: '2026-07-03', litros: 5 }),
    ];

    mockLecheFacade.registros = () => registros;
    fixture = TestBed.createComponent(ProduccionDiariaReport);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.totalItems()).toBe(3);
    expect(component.totalLitrosReal()).toBe(27);
    expect(component.totalLitrosIdoneo()).toBe(17);
  });

  it('navega de regreso a /leche/reporte', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.goBack();

    expect(navigateSpy).toHaveBeenCalledWith(['/leche/reporte']);
  });

  it('descarga excel con filtros de fecha', async () => {
    const start = new Date('2026-07-01');
    const end = new Date('2026-07-05');
    const createObjectURLSpy = vi
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:excel');
    const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    const anchorClickSpy = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      click: anchorClickSpy,
    } as unknown as HTMLAnchorElement);

    component.onRangeChange({ start, end });

    await component.onDownload('excel');

    expect(mockLecheRepository.downloadExcel).toHaveBeenCalledWith({
      fechaDesde: '2026-07-01',
      fechaHasta: '2026-07-05',
    });
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(anchorClickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:excel');
    createElementSpy.mockRestore();
  });

  it('descarga pdf con filtros de fecha', async () => {
    const start = new Date('2026-08-10');
    const end = new Date('2026-08-12');
    const createObjectURLSpy = vi
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:pdf');
    const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    const anchorClickSpy = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      click: anchorClickSpy,
    } as unknown as HTMLAnchorElement);

    component.onRangeChange({ start, end });

    await component.onDownload('pdf');

    expect(mockLecheRepository.downloadPdf).toHaveBeenCalledWith({
      fechaDesde: '2026-08-10',
      fechaHasta: '2026-08-12',
    });
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(anchorClickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:pdf');
    createElementSpy.mockRestore();
  });

  it('descarga excel sin filtros cuando no hay rango seleccionado', async () => {
    const createObjectURLSpy = vi
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:excel-empty');
    const revokeObjectURLSpy = vi
      .spyOn(window.URL, 'revokeObjectURL')
      .mockImplementation(() => {});
    const anchorClickSpy = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      click: anchorClickSpy,
    } as unknown as HTMLAnchorElement);

    await component.onDownload('excel');

    expect(mockLecheRepository.downloadExcel).toHaveBeenCalledWith({});
    expect(anchorClickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:excel-empty');
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  it('maneja errores de descarga sin lanzar excepcion', async () => {
    const error = new Error('fallo al descargar');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLecheRepository.downloadPdf.mockReturnValueOnce(
      new Observable((subscriber) => subscriber.error(error)),
    );

    await expect(component.onDownload('pdf')).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error al descargar formato pdf:', error);
  });
});
