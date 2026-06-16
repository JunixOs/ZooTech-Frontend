import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ReporteChartGeneral } from './reporte-chart-general';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

const MOCK_TRIAJES = [
  { id: 1, codigo: 'T-0001', fechaHora: new Date().toISOString(), vacunoId: 1, vacunoNombre: 'V-001 — Lola', tipoPesoCode: 'CONTROL', pesoKg: 42.5, observaciones: null, estadoRegistroCode: 'ACTIVO', encargadoUsuarioId: null, createdAt: new Date().toISOString() },
  { id: 2, codigo: 'T-0002', fechaHora: new Date(Date.now() - 1 * 86400000).toISOString(), vacunoId: 2, vacunoNombre: 'V-002 — Blanquita', tipoPesoCode: 'ANUAL', pesoKg: 38.2, observaciones: null, estadoRegistroCode: 'ACTIVO', encargadoUsuarioId: null, createdAt: new Date().toISOString() },
];

// Use local-timezone dates to avoid UTC→local offset issues with toISODate
const START_DATE = new Date(2026, 0, 1);
const END_DATE = new Date(2026, 0, 31);

describe('ReporteChartGeneral', () => {
  let component: ReporteChartGeneral;
  let fixture: ComponentFixture<ReporteChartGeneral>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteChartGeneral],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteChartGeneral);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('hasSelectedDates debe ser false sin rango', () => {
    expect(component.hasSelectedDates()).toBe(false);
  });

  it('hasSelectedDates debe ser true con rango completo', () => {
    fixture.componentRef.setInput('dateRange', {
      start: START_DATE,
      end: END_DATE,
    });
    fixture.detectChanges();
    expect(component.hasSelectedDates()).toBe(true);

    // Flush request triggered by dateRange effect so afterEach verify passes
    httpMock.expectOne((r) => r.url.includes('/reporte/general')).flush({ data: [], success: true, errorMessage: null });
  });

  it('debe cargar datos cuando se selecciona rango', () => {
    fixture.componentRef.setInput('dateRange', {
      start: START_DATE,
      end: END_DATE,
    });
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.includes('/reporte/general'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('fechaInicio')).toBe('2026-01-01');
    expect(req.request.params.get('fechaFin')).toBe('2026-01-31');
    req.flush({ data: MOCK_TRIAJES, success: true, errorMessage: null });
    fixture.detectChanges();

    expect(component.triajes().length).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('chartPoints debe generar puntos correctamente', () => {
    component.triajes.set(MOCK_TRIAJES);
    const pts = component.chartPoints();
    expect(pts.length).toBe(2);
    expect(pts[0].val).toBe(42.5);
    expect(pts[1].val).toBe(38.2);
  });

  it('linePath debe ser SVG path válido', () => {
    component.triajes.set(MOCK_TRIAJES);
    expect(component.linePath()).toContain('M ');
    expect(component.linePath()).toContain('L ');
  });

  it('areaPath debe ser SVG path de área', () => {
    component.triajes.set(MOCK_TRIAJES);
    const path = component.areaPath();
    expect(path).toContain('M ');
    expect(path).toContain('Z');
  });

  it('yTicks debe devolver valores por defecto sin datos', () => {
    expect(component.yTicks().length).toBeGreaterThan(0);
  });

  it('volver output debe emitir en goBack', () => {
    const spy = vi.fn();
    component.volver.subscribe(spy);
    component.goBack();
    expect(spy).toHaveBeenCalledOnce();
  });
});
