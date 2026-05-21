import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SidebarNavItem } from './sidebar-nav-item';
import { NavSection } from '../../models/nav-item.model';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('SidebarNavItem', () => {
  let component: SidebarNavItem;
  let fixture: ComponentFixture<SidebarNavItem>;

  const sectionWithChildren: NavSection = {
    icon: 'fa-solid fa-paw',
    label: 'sidebar.reproduccion',
    children: [
      { icon: 'fa-solid fa-circle-dot', label: 'sidebar.celo', router: '/reproduccion/celo' },
    ],
  };

  const sectionWithoutChildren: NavSection = {
    icon: 'fa-solid fa-home',
    label: 'menu.dashboard',
    router: '/dashboard',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNavItem],
      providers: [
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarNavItem);
    component = fixture.componentInstance;
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      fixture.componentRef.setInput('section', sectionWithChildren);
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('debe iniciar con isOpen en false', () => {
      fixture.componentRef.setInput('section', sectionWithChildren);
      fixture.detectChanges();
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('toggle', () => {
    it('debe alternar isOpen', () => {
      fixture.componentRef.setInput('section', sectionWithChildren);
      fixture.detectChanges();

      expect(component.isOpen()).toBe(false);
      component.toggle();
      expect(component.isOpen()).toBe(true);
      component.toggle();
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('sección con children', () => {
    it('debe renderizar botón de toggle', () => {
      fixture.componentRef.setInput('section', sectionWithChildren);
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('button');
      expect(btn).toBeTruthy();
    });

    it('debe mostrar hijos cuando isOpen es true', () => {
      fixture.componentRef.setInput('section', sectionWithChildren);
      fixture.detectChanges();

      component.toggle();
      fixture.detectChanges();

      const links = fixture.nativeElement.querySelectorAll('a');
      expect(links.length).toBe(1);
    });

    it('NO debe mostrar hijos cuando isOpen es false', () => {
      fixture.componentRef.setInput('section', sectionWithChildren);
      fixture.detectChanges();

      const links = fixture.nativeElement.querySelectorAll('a');
      expect(links.length).toBe(0);
    });
  });

  describe('sección sin children', () => {
    it('debe renderizar un link directo', () => {
      fixture.componentRef.setInput('section', sectionWithoutChildren);
      fixture.detectChanges();

      const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
      expect(link).toBeTruthy();
      expect(link.href).toContain('/dashboard');
    });

    it('NO debe tener botón de toggle', () => {
      fixture.componentRef.setInput('section', sectionWithoutChildren);
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('button');
      expect(btn).toBeFalsy();
    });
  });
});
