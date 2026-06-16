import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ReporteContainer } from './reporte-container';
import { TriajeService } from '@modules/sanidad/services/triaje.service';
import { ToastService } from '@core/notifications/toast.service';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({
      'sanidad.reportes.title': 'Reportes',
      'sanidad.reportes.breadcrumb': 'Reportes',
      'sanidad.reportes.charts.generalTriageTitle': 'Gráfico General',
      'sanidad.reportes.charts.listadoTitle': 'Listado de Triajes',
    });
  }
}

const mockToastService = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
};

const MOCK_TRIAJE = {
  id: 1,
  codigo: 'T-0001',
  fechaHora: new Date().toISOString(),
  vacunoId: 1,
  vacunoNombre: 'V-001 — Lola',
  tipoPesoCode: 'CONTROL',
  pesoKg: 42.5,
  observaciones: null,
  estadoRegistroCode: 'ACTIVO',
  encargadoUsuarioId: null,
  createdAt: new Date().toISOString(),
};

const MOCK_HISTORIAL = [
  { id: 101, fechaHora: new Date().toISOString(), pesoKg: 42.5, tipoPesoCode: 'CONTROL', observaciones: undefined },
];

describe('ReporteContainer', () => {
  let component: ReporteContainer;
  let fixture: ComponentFixture<ReporteContainer>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteContainer],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteContainer);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('selectedReport debe iniciar como null', () => {
    expect(component.selectedReport()).toBeNull();
  });

  it('debe tener 4 reportes configurados', () => {
    expect(component.reports().length).toBe(4);
    expect(component.reports()[0].title).toBe('sanidad.cards.reporteListadoGeneralTriaje.title');
    expect(component.reports()[1].title).toBe('sanidad.cards.graficoTriajeVacuno.title');
    expect(component.reports()[2].title).toBe('sanidad.cards.reporteListadoTriajeVacuno.title');
    expect(component.reports()[3].title).toBe('sanidad.cards.graficoTriajeGeneral.title');
  });

  describe('pageTitle', () => {
    it('debe mostrar título por defecto cuando no hay reporte seleccionado', () => {
      expect(component.pageTitle()).toBe('sanidad.reportes.title');
    });

    it('debe mostrar título de listado', () => {
      component.selectedReport.set('listado-triajes');
      expect(component.pageTitle()).toBe('sanidad.reportes.charts.listadoTitle');
    });

    it('debe mostrar título de gráfico general', () => {
      component.selectedReport.set('grafico-triaje-general');
      expect(component.pageTitle()).toBe('sanidad.reportes.charts.generalTriageTitle');
    });
  });

  describe('volver', () => {
    it('debe limpiar selectedReport', () => {
      component.selectedReport.set('listado-triajes');
      component.volver();
      expect(component.selectedReport()).toBeNull();
    });
  });

  describe('onOpen callbacks', () => {
    it('el primer reporte debe seleccionar listado-triajes', () => {
      component.reports()[0].onOpen!();
      expect(component.selectedReport()).toBe('listado-triajes');
    });

    it('el segundo reporte debe seleccionar grafico-triaje-vacuno', () => {
      component.reports()[1].onOpen!();
      expect(component.selectedReport()).toBe('grafico-triaje-vacuno');
    });
  });

  describe('applyFilter', () => {
    it('debe copiar tempDateRange a appliedDateRange', () => {
      const range = { start: new Date('2026-01-01'), end: new Date('2026-01-31') };
      component.tempDateRange.set(range);
      component.applyFilter();
      expect(component.appliedDateRange()).toEqual(range);
    });
  });

  describe('onVerTriaje', () => {
    it('debe cargar triaje por ID y abrir modal', () => {
      component.onVerTriaje(MOCK_TRIAJE);

      const req1 = httpMock.expectOne((r) => r.url.includes('/triaje/1'));
      expect(req1.request.method).toBe('GET');
      req1.flush({ data: MOCK_TRIAJE });

      const req2 = httpMock.expectOne((r) => r.url.includes('/historial/1'));
      expect(req2.request.method).toBe('GET');
      req2.flush({ data: MOCK_HISTORIAL });

      expect(component.selectedTriaje()).toEqual(MOCK_TRIAJE);
      expect(component.historial().length).toBe(1);
      expect(component.showViewTriage()).toBe(true);
    });
  });

  describe('closeViewTriage', () => {
    it('debe cerrar modal y limpiar datos', () => {
      component.selectedTriaje.set(MOCK_TRIAJE);
      component.historial.set(MOCK_HISTORIAL);
      component.showViewTriage.set(true);

      component.closeViewTriage();

      expect(component.showViewTriage()).toBe(false);
      expect(component.selectedTriaje()).toBeNull();
      expect(component.historial().length).toBe(0);
    });
  });
});
