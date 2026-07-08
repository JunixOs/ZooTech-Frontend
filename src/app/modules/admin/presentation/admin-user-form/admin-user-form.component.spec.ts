import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { AdminUserFormComponent } from './admin-user-form.component';
import { AdminUserApiService } from '../../infrastructure/admin-user-api.service';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('AdminUserFormComponent', () => {
  let component: AdminUserFormComponent;
  let fixture: ComponentFixture<AdminUserFormComponent>;
  let adminUserService: AdminUserApiService;

  beforeEach(async () => {
    const adminUserServiceMock = {
      createAdminUser: vi.fn().mockReturnValue(of({ email: 'test@test.com', userName: 'test', firstName: 'Test' })),
    };

    await TestBed.configureTestingModule({
      imports: [AdminUserFormComponent],
      providers: [
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        { provide: AdminUserApiService, useValue: adminUserServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUserFormComponent);
    component = fixture.componentInstance;
    adminUserService = TestBed.inject(AdminUserApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default form data', () => {
    expect(component.formData.isActive).toBe(true);
    expect(component.formData.email).toBe('');
  });

  it('should show error when required fields are missing', () => {
    component.formData.email = '';
    component.onSubmit();

    expect(component.error()).toBe('admin.users.form.errors.required');
  });

  it('should emit created on successful submission', () => {
    const createdSpy = vi.spyOn(component.created, 'emit');

    component.formData.email = 'test@test.com';
    component.formData.userName = 'test';
    component.formData.password = 'password123';

    component.onSubmit();

    expect(adminUserService.createAdminUser).toHaveBeenCalled();
    expect(createdSpy).toHaveBeenCalled();
  });

  it('should set error when creation fails', () => {
    vi.spyOn(adminUserService, 'createAdminUser').mockReturnValue(
      throwError(() => new Error('Error')),
    );

    component.formData.email = 'test@test.com';
    component.formData.userName = 'test';
    component.formData.password = 'password123';

    component.onSubmit();

    expect(component.error()).toBe('admin.users.form.errors.createFailed');
  });

  it('should emit cancelled when onCancel is called', () => {
    const cancelledSpy = vi.spyOn(component.cancelled, 'emit');

    component.onCancel();

    expect(cancelledSpy).toHaveBeenCalled();
  });
});
