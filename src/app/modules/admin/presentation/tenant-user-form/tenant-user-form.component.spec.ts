import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { TenantUserFormComponent } from './tenant-user-form.component';
import { TenantApiService } from '../../infrastructure/tenant-api.service';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('TenantUserFormComponent', () => {
  let component: TenantUserFormComponent;
  let fixture: ComponentFixture<TenantUserFormComponent>;
  let tenantApiService: TenantApiService;

  beforeEach(async () => {
    const tenantApiServiceMock = {
      createUserInTenant: vi.fn().mockReturnValue(of({ email: 'test@test.com', userName: 'test', fullName: 'Test' })),
    };

    await TestBed.configureTestingModule({
      imports: [TenantUserFormComponent],
      providers: [
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        { provide: TenantApiService, useValue: tenantApiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantUserFormComponent);
    component = fixture.componentInstance;
    tenantApiService = TestBed.inject(TenantApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default form data', () => {
    expect(component.formData.isActive).toBe(true);
    expect(component.formData.code).toBe('');
  });

  it('should show error when required fields are missing', () => {
    component.formData.code = '';
    component.onSubmit();

    expect(component.error()).toBe('admin.tenants.userForm.errors.required');
  });

  it('should show success on successful submission', () => {
    component.formData.code = 'test';
    component.formData.userName = 'test';
    component.formData.email = 'test@test.com';
    component.formData.tenantDatabaseName = 'testdb';

    component.onSubmit();

    expect(tenantApiService.createUserInTenant).toHaveBeenCalled();
    expect(component.success()).toBe(true);
  });

  it('should set error when creation fails', () => {
    vi.spyOn(tenantApiService, 'createUserInTenant').mockReturnValue(
      throwError(() => new Error('Error')),
    );

    component.formData.code = 'test';
    component.formData.userName = 'test';
    component.formData.email = 'test@test.com';
    component.formData.tenantDatabaseName = 'testdb';

    component.onSubmit();

    expect(component.error()).toBe('admin.tenants.userForm.errors.createFailed');
  });
});
