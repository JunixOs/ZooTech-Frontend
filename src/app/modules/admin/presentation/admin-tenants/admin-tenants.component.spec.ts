import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AdminTenantsComponent } from './admin-tenants.component';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('AdminTenantsComponent', () => {
  let component: AdminTenantsComponent;
  let fixture: ComponentFixture<AdminTenantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTenantsComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTenantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the container', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.admin-tenants-container')).toBeTruthy();
  });

  it('should render two sections', () => {
    const el = fixture.nativeElement as HTMLElement;
    const sections = el.querySelectorAll('.admin-tenants-section');
    expect(sections.length).toBe(2);
  });
});
