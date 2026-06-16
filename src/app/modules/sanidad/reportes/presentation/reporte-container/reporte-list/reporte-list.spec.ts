import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ReportesList } from './reporte-list';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

const MOCK_TRIAAJES = [
  { id: 1, codigo: 'T-0001', fechaHora: new Date().toISOString(), vacunoId: 1, vacunoNombre: 'V-001 — Lola', tipoPesoCode: 'CONTROL', pesoKg: 42.5, observaciones: null, estadoRegistroCode: 'ACTIVO', encargadoUsuarioId: null, createdAt: new Date().toISOString() },
  { id: 2, codigo: 'T-0002', fechaHora: new Date().toISOString(), vacunoId: 2, vacunoNombre: 'V-002 — Blanquita', tipoPesoCode: 'ANUAL', pesoKg: 38.2, observaciones: null, estadoRegistroCode: 'ACTIVO', encargadoUsuarioId: null, createdAt: new Date().toISOString() },
];

const MOCK_PAGE = {
  data: MOCK_TRIAJES,
  totalRegistros: 2,
  pagina: 1,
  tamano: 10,
  totalPaginas: 1,
};

const EMPTY_PAGE = { data: [], totalRegistros: 0, pagina: 1, tamano: 10, totalPaginas: 0 };
const EMPTY_PAGE_WRAPPED = { data: EMPTY_PAGE, success: true, errorMessage: null };

describe('ReportesList', () => {
  let component: ReportesList;
  let fixture: ComponentFixture<ReportesList>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesList);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Flush initial load from ngOnInit so tests start clean
    httpMock.expectOne((r) => r.url.includes('/api/v1/triaje')).flush(EMPTY_PAGE_WRAPPED);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener 5 columnas definidas', () => {
    expect(component.columns.length).toBe(5);
    expect(component.columns[0].key).toBe('fechaHora');
    expect(component.columns[1].key).toBe('codigo');
  });

  it('debe empezar con valores por defecto', () => {
    expect(component.paginaActual()).toBe(1);
    expect(component.tamano()).toBe(10);
    expect(component.triajes()).toEqual([]);
    expect(component.loading()).toBe(false);
  });

  it('tableData debe transformar triajes correctamente', () => {
    component.triajes.set(MOCK_TRIAAJES);
    fixture.detectChanges();

    const data = component.tableData();
    expect(data.length).toBe(2);
    expect(data[0].codigo).toBe('T-0001');
    expect(data[0].pesoKg).toContain('kg');
    expect(data[0]._raw).toBe(MOCK_TRIAAJES[0] as unknown);
  });

  it('cambiarPagina debe actualizar paginaActual', () => {
    component.cambiarPagina(3);
    expect(component.paginaActual()).toBe(3);
    // Flush HTTP triggered by loadTriajes so afterEach verify passes
    httpMock.expectOne((r) => r.url.includes('/api/v1/triaje')).flush(EMPTY_PAGE_WRAPPED);
  });

  it('onPageSizeChange debe resetear a página 1 y cambiar tamaño', () => {
    component.paginaActual.set(5);
    component.onPageSizeChange(25);
    expect(component.tamano()).toBe(25);
    expect(component.paginaActual()).toBe(1);
    // Flush HTTP triggered by loadTriajes so afterEach verify passes
    httpMock.expectOne((r) => r.url.includes('/api/v1/triaje')).flush(EMPTY_PAGE_WRAPPED);
  });

  it('onColumnFilter debe resetear a página 1 y guardar filtros', () => {
    component.paginaActual.set(3);
    component.onColumnFilter({ codigo: 'T-0001' });
    expect(component.paginaActual()).toBe(1);
    expect(component.filtros()['codigo']).toBe('T-0001');
    // Flush HTTP triggered by loadTriajes so afterEach verify passes
    httpMock.expectOne((r) => r.url.includes('/api/v1/triaje')).flush(EMPTY_PAGE_WRAPPED);
  });

  it('onVerTriaje debe emitir el triaje con _raw', () => {
    const spy = vi.fn();
    component.verTriaje.subscribe(spy);

    const row = { codigo: 'T-0001', pesoKg: '42.5 kg', _raw: MOCK_TRIAAJES[0] as unknown };
    component.onVerTriaje(row);

    expect(spy).toHaveBeenCalledWith(MOCK_TRIAAJES[0]);
  });

  it('debe cargar datos en ngOnInit via HTTP', () => {
    component.ngOnInit();

    const req = httpMock.expectOne((r) => r.url.includes('/api/v1/triaje') && !r.url.includes('reporte') && !r.url.includes('vacunos') && !r.url.includes('tipos-peso') && !r.url.includes('historial'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pagina')).toBe('1');
    expect(req.request.params.get('tamano')).toBe('10');

    req.flush({ data: MOCK_PAGE, success: true, errorMessage: null });
    fixture.detectChanges();

    expect(component.triajes().length).toBe(2);
    expect(component.totalRegistros()).toBe(2);
    expect(component.totalPaginas()).toBe(1);
    expect(component.loading()).toBe(false);
  });
});
