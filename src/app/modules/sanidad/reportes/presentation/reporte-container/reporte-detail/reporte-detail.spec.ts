import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ReportesDetail } from './reporte-detail';

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
  { id: 102, fechaHora: new Date(Date.now() - 7 * 86400000).toISOString(), pesoKg: 41.8, tipoPesoCode: 'CONTROL', observaciones: 'Estable' },
];

describe('ReportesDetail', () => {
  let component: ReportesDetail;
  let fixture: ComponentFixture<ReportesDetail>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesDetail);
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

  it('debe limpiar historial si se deselecciona vacuno', () => {
    // First select a vacuno to populate historial via the effect
    component.selectedVacunoId.set(1);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.includes('/historial/1')).flush({ data: MOCK_HISTORIAL, success: true, errorMessage: null });
    fixture.detectChanges();
    expect(component.historial().length).toBe(2);

    // Then deselect — effect re-runs and clears historial
    component.selectedVacunoId.set(null);
    fixture.detectChanges();
    expect(component.historial().length).toBe(0);
  });

  it('volver output debe emitir al llamar goBack', () => {
    const spy = vi.fn();
    component.volver.subscribe(spy);
    component.goBack();
    expect(spy).toHaveBeenCalledOnce();
  });
});
