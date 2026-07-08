import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { TenantFormComponent } from './tenant-form.component';
import { TenantApiService } from '../../infrastructure/tenant-api.service';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('TenantFormComponent', () => {
  let component: TenantFormComponent;
  let fixture: ComponentFixture<TenantFormComponent>;
  let tenantApiService: TenantApiService;

  beforeEach(async () => {
    const tenantApiServiceMock = {
      createTenant: vi.fn().mockReturnValue(of({ code: 'test', subDomain: 'test', displayName: 'Test', legalName: 'Test' })),
    };

    await TestBed.configureTestingModule({
      imports: [TenantFormComponent],
      providers: [
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        { provide: TenantApiService, useValue: tenantApiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantFormComponent);
    component = fixture.componentInstance;
    tenantApiService = TestBed.inject(TenantApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default form data', () => {
    expect(component.formData.timeZone).toBe('America/Lima');
    expect(component.formData.tenantDatabaseConnection.isActive).toBe(true);
  });

  it('should show error when required fields are missing', () => {
    component.formData.code = '';
    component.onSubmit();

    expect(component.error()).toBe('admin.tenants.form.errors.required');
  });

  it('should show success on successful submission', () => {
    component.formData.code = 'test';
    component.formData.subDomain = 'test';
    component.formData.displayName = 'Test';

    component.onSubmit();

    expect(tenantApiService.createTenant).toHaveBeenCalled();
    expect(component.success()).toBe(true);
  });

  it('should set error when creation fails', () => {
    vi.spyOn(tenantApiService, 'createTenant').mockReturnValue(
      throwError(() => new Error('Error')),
    );

    component.formData.code = 'test';
    component.formData.subDomain = 'test';
    component.formData.displayName = 'Test';

    component.onSubmit();

    expect(component.error()).toBe('admin.tenants.form.errors.createFailed');
  });
});
