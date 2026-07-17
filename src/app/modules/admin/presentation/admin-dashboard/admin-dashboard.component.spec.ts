import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminUserApiService } from '../../infrastructure/admin-user-api.service';
import { AdminUser } from '../../domain/admin-user.model';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
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
    {
      id: 2,
      email: 'admin2@test.com',
      username: 'admin2',
      firstName: 'Admin2',
      isActive: true,
      lastLoginAt: null,
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    const adminUserServiceMock = {
      listAdminUsers: vi.fn().mockReturnValue(of(mockUsers)),
    };

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        { provide: AdminUserApiService, useValue: adminUserServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    adminUserService = TestBed.inject(AdminUserApiService);
    fixture.detectChanges();
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('carga de datos', () => {
    it('debe cargar la cantidad de usuarios al iniciar', () => {
      expect(adminUserService.listAdminUsers).toHaveBeenCalled();
      expect(component.totalUsers()).toBe(2);
    });
  });

  describe('template', () => {
    it('debe renderizar el contenedor principal admin-dashboard', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.admin-dashboard')).toBeTruthy();
    });

    it('debe renderizar las cards de estadísticas', () => {
      const el = fixture.nativeElement as HTMLElement;
      const statCards = el.querySelectorAll('.admin-dashboard__stat-card');
      expect(statCards.length).toBe(2);
    });

    it('debe renderizar las acciones rápidas', () => {
      const el = fixture.nativeElement as HTMLElement;
      const actionCards = el.querySelectorAll('.admin-dashboard__action-card');
      expect(actionCards.length).toBe(2);
    });

    it('debe mostrar el total de usuarios', () => {
      const el = fixture.nativeElement as HTMLElement;
      const statValue = el.querySelector('.admin-dashboard__stat-value');
      expect(statValue?.textContent?.trim()).toBe('2');
    });
  });
});
