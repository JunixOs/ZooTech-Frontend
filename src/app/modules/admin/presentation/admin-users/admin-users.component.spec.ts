import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { AdminUserApiService } from '../../infrastructure/admin-user-api.service';
import { AdminUser } from '../../domain/admin-user.model';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let fixture: ComponentFixture<AdminUsersComponent>;
  let adminUserService: AdminUserApiService;

  const mockUsers: AdminUser[] = [
    {
      id: 1,
      email: 'admin@test.com',
      username: 'admin',
      firstName: 'Admin',
      isActive: true,
      lastLoginAt: null,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    const adminUserServiceMock = {
      listAdminUsers: vi.fn().mockReturnValue(of(mockUsers)),
      deleteAdminUser: vi.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        { provide: AdminUserApiService, useValue: adminUserServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
    adminUserService = TestBed.inject(AdminUserApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(adminUserService.listAdminUsers).toHaveBeenCalled();
    expect(component.users()).toEqual(mockUsers);
  });

  it('should set error when load fails', () => {
    vi.spyOn(adminUserService, 'listAdminUsers').mockReturnValue(
      throwError(() => new Error('Error')),
    );

    component.ngOnInit();

    expect(component.error()).toBe('admin.users.errors.loadFailed');
  });

  it('should toggle form visibility', () => {
    expect(component.showForm()).toBe(false);

    component.onShowForm();
    expect(component.showForm()).toBe(true);

    component.onHideForm();
    expect(component.showForm()).toBe(false);
  });

  it('should reload users after creation', () => {
    const loadSpy = vi.spyOn(component, 'loadUsers');

    component.onUserCreated();

    expect(component.showForm()).toBe(false);
    expect(loadSpy).toHaveBeenCalled();
  });
});
