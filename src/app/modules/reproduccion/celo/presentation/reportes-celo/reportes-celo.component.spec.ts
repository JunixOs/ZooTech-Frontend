import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ReportesCeloComponent } from './reportes-celo.component';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({
      'reproduccion.celo.reportes.title': 'Reportes de Celo',
      'sidebar.reproduccion': 'REPRODUCCIÓN',
      'sidebar.celo': 'Celo',
      'sidebar.reportes': 'Reportes',
    });
  }
}

describe('ReportesCeloComponent', () => {
  let component: ReportesCeloComponent;
  let fixture: ComponentFixture<ReportesCeloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesCeloComponent],
      providers: [
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesCeloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('filteredReports', () => {
    it('debe devolver los 4 reportes sin filtro', () => {
      expect(component.filteredReports().length).toBe(4);
    });

    it('debe filtrar por término que matchea el title', () => {
      component.onSearch('vacuno');
      const filtered = component.filteredReports();
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.route)).toEqual([
        '/reproduccion/celo/reportes/por-vacuno',
        '/reproduccion/celo/reportes/comparacion-por-vacuno',
      ]);
    });

    it('debe filtrar por término que matchea solo la description', () => {
      component.onSearch('gráfico');
      const filtered = component.filteredReports();
      expect(filtered.length).toBe(2);
      for (const r of filtered) {
        expect(r.description.toLowerCase()).toContain('gráfico');
      }
    });

    it('debe ser case-insensitive', () => {
      component.onSearch('VACUNO');
      expect(component.filteredReports().length).toBe(2);
    });

    it('debe devolver vacío cuando no hay coincidencias', () => {
      component.onSearch('inexistente');
      expect(component.filteredReports().length).toBe(0);
    });

    it('debe trimear el término antes de filtrar', () => {
      component.onSearch('  vacuno  ');
      expect(component.filteredReports().length).toBe(2);
    });

    it('debe devolver todos los reportes si el término queda vacío tras el trim', () => {
      component.onSearch('   ');
      expect(component.filteredReports().length).toBe(4);
    });
  });

  describe('onRangeChange', () => {
    it('debe actualizar dateRange con el rango recibido', () => {
      const range = { start: new Date('2026-05-01'), end: new Date('2026-05-10') };
      component.onRangeChange(range);
      expect(component.dateRange()).toEqual(range);
    });
  });

  describe('template', () => {
    it('debe renderizar el título y breadcrumb vía claves i18n', () => {
      const el = fixture.nativeElement.textContent;
      expect(el).toContain('reproduccion.celo.reportes.title');
      expect(el).toContain('sidebar.reproduccion');
      expect(el).toContain('sidebar.celo');
      expect(el).toContain('sidebar.reportes');
    });
  });
});
