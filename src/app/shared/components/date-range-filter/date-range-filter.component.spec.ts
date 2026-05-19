import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { DateRangeFilterComponent } from './date-range-filter.component';
import { FormsModule } from '@angular/forms';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('DateRangeFilterComponent', () => {
  let component: DateRangeFilterComponent;
  let fixture: ComponentFixture<DateRangeFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangeFilterComponent, FormsModule],
      providers: [
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangeFilterComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Filtrar por fecha');
    fixture.detectChanges();
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar fechas vacías', () => {
      expect(component.startDate()).toBe('');
      expect(component.endDate()).toBe('');
    });
  });

  describe('onStartChange', () => {
    it('debe actualizar startDate', () => {
      component.onStartChange('2026-05-01');
      expect(component.startDate()).toBe('2026-05-01');
    });

    it('NO debe emitir si endDate está vacía', () => {
      const spy = vi.fn();
      component.rangeChange.subscribe(spy);

      component.onStartChange('2026-05-01');

      expect(spy).not.toHaveBeenCalled();
    });

    it('debe emitir range cuando ambas fechas están seteadas', () => {
      component.onEndChange('2026-05-15');
      fixture.detectChanges();

      const spy = vi.fn();
      component.rangeChange.subscribe(spy);

      component.onStartChange('2026-05-01');

      expect(spy).toHaveBeenCalledOnce();
      const emitted = spy.mock.calls[0][0];
      expect(emitted.start).toBeInstanceOf(Date);
      expect(emitted.end).toBeInstanceOf(Date);
    });
  });

  describe('onEndChange', () => {
    it('debe actualizar endDate', () => {
      component.onEndChange('2026-05-15');
      expect(component.endDate()).toBe('2026-05-15');
    });

    it('debe emitir range incluso sin startDate (emite null)', () => {
      const spy = vi.fn();
      component.rangeChange.subscribe(spy);

      component.onEndChange('2026-05-15');

      expect(spy).toHaveBeenCalledOnce();
      const emitted = spy.mock.calls[0][0];
      expect(emitted.start).toBeNull();
      expect(emitted.end).toBeInstanceOf(Date);
    });

    it('debe emitir ambas fechas como Date cuando están seteadas', () => {
      component.onStartChange('2026-05-01');
      fixture.detectChanges();

      const spy = vi.fn();
      component.rangeChange.subscribe(spy);

      component.onEndChange('2026-05-15');

      expect(spy).toHaveBeenCalledOnce();
      const emitted = spy.mock.calls[0][0];
      expect(emitted.start).toBeInstanceOf(Date);
      expect(emitted.end).toBeInstanceOf(Date);
    });
  });

  describe('onClear', () => {
    it('debe limpiar ambas fechas', () => {
      component.onStartChange('2026-05-01');
      component.onEndChange('2026-05-15');
      fixture.detectChanges();

      component.onClear();

      expect(component.startDate()).toBe('');
      expect(component.endDate()).toBe('');
    });

    it('debe emitir range con null en ambos', () => {
      const spy = vi.fn();
      component.rangeChange.subscribe(spy);

      component.onClear();

      expect(spy).toHaveBeenCalledWith({ start: null, end: null });
    });
  });
});