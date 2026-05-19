import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { SearchInputComponent } from './search-input.component';
import { FormsModule } from '@angular/forms';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, FormsModule],
      providers: [
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('placeholder', 'Buscar...');
    fixture.detectChanges();
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar term como string vacío', () => {
      expect(component.term()).toBe('');
    });
  });

  describe('onInput', () => {
    it('debe actualizar term al escribir', () => {
      component.onInput('vaca');
      fixture.detectChanges();
      expect(component.term()).toBe('vaca');
    });
  });

  describe('onSearch', () => {
    it('debe emitir el término actual al buscar', () => {
      component.onInput('luna');
      fixture.detectChanges();

      const spy = vi.fn();
      component.search.subscribe(spy);
      component.onSearch();

      expect(spy).toHaveBeenCalledWith('luna');
    });

    it('debe emitir string vacío si no hay término', () => {
      const spy = vi.fn();
      component.search.subscribe(spy);
      component.onSearch();

      expect(spy).toHaveBeenCalledWith('');
    });
  });

  describe('onClear', () => {
    it('debe limpiar term y emitir string vacío', () => {
      component.onInput('algo');
      fixture.detectChanges();

      const spy = vi.fn();
      component.search.subscribe(spy);
      component.onClear();

      expect(component.term()).toBe('');
      expect(spy).toHaveBeenCalledWith('');
    });
  });

  describe('onKeydown', () => {
    it('debe buscar al presionar Enter', () => {
      component.onInput('test');
      const spy = vi.fn();
      component.search.subscribe(spy);

      component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(spy).toHaveBeenCalledWith('test');
    });

    it('debe limpiar al presionar Escape', () => {
      component.onInput('test');
      fixture.detectChanges();

      const spy = vi.fn();
      component.search.subscribe(spy);

      component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(component.term()).toBe('');
      expect(spy).toHaveBeenCalledWith('');
    });

    it('NO debe hacer nada con otras teclas', () => {
      component.onInput('test');
      const spy = vi.fn();
      component.search.subscribe(spy);

      component.onKeydown(new KeyboardEvent('keydown', { key: 'a' }));

      expect(spy).not.toHaveBeenCalled();
      expect(component.term()).toBe('test');
    });
  });

  describe('template', () => {
    it('debe mostrar el placeholder pasado por input', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(input.placeholder).toBe('Buscar...');
    });

    it('debe tener un botón de buscar', () => {
      const searchBtn = fixture.nativeElement.querySelector('button');
      expect(searchBtn).toBeTruthy();
    });
  });
});
