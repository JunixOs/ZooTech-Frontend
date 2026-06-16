import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ReportesChartVacuno } from './reporte-chart-vacuno';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

const MOCK_VACUNOS = [
  { id: 1, codigo: 'V-001', nombre: 'Lola' },
  { id: 2, codigo: 'V-002', nombre: 'Blanquita' },
];

const MOCK_HISTORIAL = [
  { id: 101, fechaHora: new Date().toISOString(), pesoKg: 42.5, tipoPesoCode: 'CONTROL', observaciones: undefined },
  { id: 102, fechaHora: new Date(Date.now() - 7 * 86400000).toISOString(), pesoKg: 41.8, tipoPesoCode: 'CONTROL', observaciones: undefined },
];

describe('ReportesChartVacuno', () => {
  let component: ReportesChartVacuno;
  let fixture: ComponentFixture<ReportesChartVacuno>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesChartVacuno],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesChartVacuno);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Flush initial getVacunos request from constructor so tests start clean
    httpMock.expectOne((r) => r.url.includes('/vacunos')).flush({ data: MOCK_VACUNOS });
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar vacunos del endpoint', () => {
    expect(component.vacunosList().length).toBe(2);
    expect(component.vacunosList()[0].nombre).toBe('Lola');
  });

  it('debe cargar historial al seleccionar vacuno', () => {
    component.selectedVacunoId.set(1);
    fixture.detectChanges();

    const histReq = httpMock.expectOne((r) => r.url.includes('/historial/1'));
    expect(histReq.request.method).toBe('GET');
    histReq.flush({ data: MOCK_HISTORIAL });
    fixture.detectChanges();

    expect(component.historial().length).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('chartPoints debe generar puntos correctamente', () => {
    component.historial.set(MOCK_HISTORIAL);
    const pts = component.chartPoints();
    expect(pts.length).toBe(2);
    expect(pts[0].val).toBe(42.5);
    expect(pts[1].val).toBe(41.8);
    expect(pts[0].x).toBeGreaterThan(0);
    expect(pts[0].y).toBeGreaterThan(0);
  });

  it('linePath debe ser SVG path válido', () => {
    component.historial.set(MOCK_HISTORIAL);
    const path = component.linePath();
    expect(path).toContain('M ');
    expect(path).toContain('L ');
  });

  it('yTicks debe devolver valores por defecto cuando no hay historial', () => {
    const ticks = component.yTicks();
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0]).toBe(5);
  });

  it('yTicks debe escalar según datos cuando hay historial', () => {
    component.historial.set(MOCK_HISTORIAL);
    const ticks = component.yTicks();
    expect(ticks.length).toBeGreaterThan(0);
  });

  it('volver output debe emitir al llamar goBack', () => {
    const spy = vi.fn();
    component.volver.subscribe(spy);
    component.goBack();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('downloadComplete output debe emitir en downloadCsv', () => {
    const spy = vi.fn();
    component.downloadComplete.subscribe(spy);
    component.historial.set(MOCK_HISTORIAL);
    component.downloadCsv();
    expect(spy).toHaveBeenCalledOnce();
  });
});
