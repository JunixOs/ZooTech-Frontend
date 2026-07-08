import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AdminParametersComponent } from './admin-parameters.component';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('AdminParametersComponent', () => {
  let component: AdminParametersComponent;
  let fixture: ComponentFixture<AdminParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminParametersComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the placeholder', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.admin-parameters-placeholder')).toBeTruthy();
  });
});
