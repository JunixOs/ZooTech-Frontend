import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard.component';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('template', () => {
    it('debe renderizar el contenedor principal admin-dashboard', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.admin-dashboard')).toBeTruthy();
    });

    it('debe renderizar el panel de contenido', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.admin-dashboard__panel')).toBeTruthy();
    });

    it('debe renderizar el h1 con título', () => {
      const el = fixture.nativeElement as HTMLElement;
      const h1 = el.querySelector('h1');
      expect(h1).toBeTruthy();
    });

    it('debe renderizar el eyebrow', () => {
      const el = fixture.nativeElement as HTMLElement;
      const eyebrow = el.querySelector('.admin-dashboard__eyebrow');
      expect(eyebrow).toBeTruthy();
    });

    it('debe renderizar la descripción', () => {
      const el = fixture.nativeElement as HTMLElement;
      const desc = el.querySelector('.admin-dashboard__description');
      expect(desc).toBeTruthy();
    });
  });
});
