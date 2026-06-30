import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { PaginatorComponent } from './paginator.component';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('PaginatorComponent', () => {
  let component: PaginatorComponent;
  let fixture: ComponentFixture<PaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatorComponent],
      providers: [
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
  });

  function setInputs(currentPage: number, pageSize: number, totalItems: number) {
    fixture.componentRef.setInput('currentPage', currentPage);
    fixture.componentRef.setInput('pageSize', pageSize);
    fixture.componentRef.setInput('totalItems', totalItems);
    fixture.detectChanges();
  }

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      setInputs(1, 10, 100);
      expect(component).toBeTruthy();
    });
  });

  describe('computed signals', () => {
    it('debe calcular totalPages correctamente', () => {
      setInputs(1, 10, 95);
      expect(component.totalPages()).toBe(10);
    });

    it('debe devolver 1 cuando no hay items', () => {
      setInputs(1, 10, 0);
      expect(component.totalPages()).toBe(1);
    });

    it('startItem debe ser 1 en la primera página', () => {
      setInputs(1, 10, 100);
      expect(component.startItem()).toBe(1);
    });

    it('startItem debe calcularse para página intermedia', () => {
      setInputs(3, 10, 100);
      expect(component.startItem()).toBe(21);
    });

    it('endItem debe ser el total en la última página', () => {
      setInputs(10, 10, 95);
      expect(component.endItem()).toBe(95);
    });

    it('endItem debe ser pageSize * currentPage cuando hay suficientes items', () => {
      setInputs(1, 10, 100);
      expect(component.endItem()).toBe(10);
    });
  });

  describe('navegación', () => {
    it('hasPrevious debe ser false en la primera página', () => {
      setInputs(1, 10, 100);
      expect(component.hasPrevious()).toBe(false);
    });

    it('hasPrevious debe ser true en la página 2', () => {
      setInputs(2, 10, 100);
      expect(component.hasPrevious()).toBe(true);
    });

    it('hasNext debe ser false en la última página', () => {
      setInputs(10, 10, 100);
      expect(component.hasNext()).toBe(false);
    });

    it('hasNext debe ser true cuando hay más páginas', () => {
      setInputs(1, 10, 100);
      expect(component.hasNext()).toBe(true);
    });
  });

  describe('goToPage', () => {
    it('debe emitir pageChange al ir a una página válida', () => {
      setInputs(1, 10, 100);
      const spy = vi.fn();
      component.pageChange.subscribe(spy);

      component.goToPage(3);

      expect(spy).toHaveBeenCalledWith(3);
    });

    it('NO debe emitir si la página es la misma', () => {
      setInputs(1, 10, 100);
      const spy = vi.fn();
      component.pageChange.subscribe(spy);

      component.goToPage(1);

      expect(spy).not.toHaveBeenCalled();
    });

    it('NO debe emitir si la página es menor a 1', () => {
      setInputs(1, 10, 100);
      const spy = vi.fn();
      component.pageChange.subscribe(spy);

      component.goToPage(0);

      expect(spy).not.toHaveBeenCalled();
    });

    it('NO debe emitir si la página excede totalPages', () => {
      setInputs(1, 10, 20);
      const spy = vi.fn();
      component.pageChange.subscribe(spy);

      component.goToPage(999);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('pageSizeChange', () => {
    it('debe emitir el nuevo tamaño al cambiar el select', () => {
      setInputs(1, 10, 100);
      const spy = vi.fn();
      component.pageSizeChange.subscribe(spy);

      const event = { target: { value: '25' } } as unknown as Event;
      component.onPageSizeChange(event);

      expect(spy).toHaveBeenCalledWith(25);
    });
  });

  describe('pages (navegación elíptica)', () => {
    it('debe mostrar todas las páginas cuando son pocas', () => {
      setInputs(1, 25, 100);
      expect(component.pages()).toEqual([1, 2, 3, 4]);
    });

    it('debe mostrar elipsis cuando hay muchas páginas y estamos al inicio', () => {
      setInputs(1, 5, 100);
      const pages = component.pages();
      expect(pages[0]).toBe(1);
      expect(pages).toContain('...');
      expect(pages[pages.length - 1]).toBe(20);
    });

    it('debe mostrar elipsis al inicio y final cuando estamos en página central', () => {
      setInputs(10, 5, 200);
      const pages = component.pages();
      expect(pages[0]).toBe(1);
      expect(pages.filter((p) => p === '...').length).toBeGreaterThanOrEqual(1);
      expect(pages[pages.length - 1]).toBe(40);
    });
  });
});
