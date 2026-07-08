import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Sidebar } from './sidebar';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('navSections', () => {
    it('debe tener 5 secciones', () => {
      const sections = component.navSections();
      expect(sections.length).toBe(5);
    });

    it('debe usar navegación tenant por defecto', () => {
      expect(component.navSections()[0].label).toBe('sidebar.vacunos');
    });

    it('debe mostrar navegación admin cuando el contexto es admin', () => {
      fixture.componentRef.setInput('appContext', 'admin');
      fixture.detectChanges();

      const sections = component.navSections();
      expect(sections.map((section) => section.label)).toEqual([
        'sidebar.admin.dashboard',
        'sidebar.admin.tenants',
        'sidebar.admin.users',
        'sidebar.admin.audit',
        'sidebar.admin.parameters',
        'sidebar.admin.settings',
      ]);
      expect(sections[0].router).toBe('/admin');
      expect(sections[1].router).toBe('/admin/tenants');
    });

    it('la primera sección debe ser Vacunos', () => {
      expect(component.navSections()[0].label).toBe('sidebar.vacunos');
      expect(component.navSections()[0].children?.length).toBe(3);
    });

    it('la segunda sección debe ser Producción de Leche', () => {
      expect(component.navSections()[1].label).toBe('sidebar.milkProduction');
      expect(component.navSections()[1].children?.length).toBe(2);
    });

    it('la tercera sección debe ser Sanidad con 2 hijos', () => {
      const seccion = component.navSections()[2];
      expect(seccion.label).toBe('sidebar.sanidad');
      expect(seccion.children?.length).toBe(2);
      expect(seccion.children?.[0].label).toBe('sidebar.triaje');
      expect(seccion.children?.[1].label).toBe('sidebar.reportes');
    });

    it('la cuarta sección debe ser Reproducción con 2 hijos', () => {
      const seccion = component.navSections()[3];
      expect(seccion.label).toBe('sidebar.reproduccion');
      expect(seccion.children?.length).toBe(2);
      expect(seccion.children?.[0].label).toBe('sidebar.celo');
      expect(seccion.children?.[1].label).toBe('sidebar.fecundacion');
    });

    it('la quinta sección debe ser Clientes', () => {
      const seccion = component.navSections()[4];
      expect(seccion.label).toBe('sidebar.clientes');
      expect(seccion.children?.length).toBe(1);
    });

    it('todas las secciones con children deben tener rutas válidas', () => {
      for (const section of component.navSections()) {
        if (section.children) {
          for (const child of section.children) {
            expect(child.router).toBeTruthy();
            expect(child.router?.startsWith('/')).toBe(true);
          }
        }
      }
    });

    it('todas las secciones deben tener icono', () => {
      for (const section of component.navSections()) {
        expect(section.icon).toBeTruthy();
        const hasValidPrefix =
          section.icon.startsWith('fa-solid') || section.icon.startsWith('fa-regular');
        expect(hasValidPrefix).toBe(true);
      }
    });
  });

  describe('cerrar sesión', () => {
    it('debe emitir el evento logout al hacer click en el botón de cerrar sesión', () => {
      let emitido = false;
      component.logout.subscribe(() => {
        emitido = true;
      });
      const logoutBtn = fixture.nativeElement.querySelector('.logout-btn') as HTMLButtonElement;
      expect(logoutBtn).toBeTruthy();
      logoutBtn.click();
      expect(emitido).toBe(true);
    });
  });
});
