import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { Shell } from './shell';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthFacade } from '@modules/auth/application/auth.facade';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('Shell', () => {
  let component: Shell;
  let fixture: ComponentFixture<Shell>;
  let router: Router;

  const mockAuthFacade = {
    logout: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [
        provideRouter([]),
        { provide: AuthFacade, useValue: mockAuthFacade },
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Shell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe iniciar appContext como tenant por defecto', () => {
      expect(component.appContext()).toBe('tenant');
    });
  });

  describe('appContext - navegación', () => {
    it('debe cambiar a admin al emitir NavigationEnd a /admin', () => {
      const events$ = new Subject<any>();
      vi.spyOn(router, 'events', 'get').mockReturnValue(events$.asObservable());

      const newFixture = TestBed.createComponent(Shell);
      const newComponent = newFixture.componentInstance;

      events$.next(new NavigationEnd(1, '/admin', '/admin'));
      expect(newComponent.appContext()).toBe('admin');
    });

    it('debe cambiar a tenant al emitir NavigationEnd a /dashboard', () => {
      const events$ = new Subject<any>();
      vi.spyOn(router, 'events', 'get').mockReturnValue(events$.asObservable());

      const newFixture = TestBed.createComponent(Shell);
      const newComponent = newFixture.componentInstance;

      events$.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
      expect(newComponent.appContext()).toBe('tenant');
    });

    it('debe mantener tenant en rutas no-admin como /login', () => {
      const events$ = new Subject<any>();
      vi.spyOn(router, 'events', 'get').mockReturnValue(events$.asObservable());

      const newFixture = TestBed.createComponent(Shell);
      const newComponent = newFixture.componentInstance;

      events$.next(new NavigationEnd(3, '/login', '/login'));
      expect(newComponent.appContext()).toBe('tenant');
    });

    it('debe mantener tenant en /not-found', () => {
      const events$ = new Subject<any>();
      vi.spyOn(router, 'events', 'get').mockReturnValue(events$.asObservable());

      const newFixture = TestBed.createComponent(Shell);
      const newComponent = newFixture.componentInstance;

      events$.next(new NavigationEnd(4, '/not-found', '/not-found'));
      expect(newComponent.appContext()).toBe('tenant');
    });

    it('debe ignorar eventos de router que no sean NavigationEnd', () => {
      const events$ = new Subject<any>();
      vi.spyOn(router, 'events', 'get').mockReturnValue(events$.asObservable());

      const newFixture = TestBed.createComponent(Shell);
      const newComponent = newFixture.componentInstance;

      const initial = newComponent.appContext();
      events$.next({ type: 'some-other-event' });
      expect(newComponent.appContext()).toBe(initial);
    });
  });

  describe('toggleSidebar', () => {
    it('debe colapsar sidebar en desktop (>= 768px)', () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
      const initial = component.sidebarCollapsed();
      component.toggleSidebar();
      expect(component.sidebarCollapsed()).toBe(!initial);
      expect(component.sidebarMobileOpen()).toBe(false);
    });

    it('debe abrir sidebar mobile en mobile (< 768px)', () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(500);
      expect(component.sidebarMobileOpen()).toBe(false);
      component.toggleSidebar();
      expect(component.sidebarMobileOpen()).toBe(true);
    });

    it('debe cerrar sidebar mobile al hacer toggle de nuevo', () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(500);
      component.toggleSidebar();
      expect(component.sidebarMobileOpen()).toBe(true);
      component.toggleSidebar();
      expect(component.sidebarMobileOpen()).toBe(false);
    });
  });

  describe('logout', () => {
    it('debe delegar el cierre de sesión al AuthFacade', () => {
      component.onLogout();

      expect(mockAuthFacade.logout).toHaveBeenCalled();
    });
  });
});
