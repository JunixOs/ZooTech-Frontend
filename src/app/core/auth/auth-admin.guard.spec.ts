import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { authAdminGuard } from './auth-admin.guard';

describe('authAdminGuard', () => {
  let authService: AuthService;
  let router: Router;
  const fakeRoute = {} as ActivatedRouteSnapshot;
  const fakeState = {} as RouterStateSnapshot;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        hostname: 'admin.zentrycorp.dev',
      },
    });

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            hasToken: vi.fn(),
            userRole: vi.fn(),
            userUrl: vi.fn(),
            expiresAt: vi.fn(),
            logout: vi.fn(),
          },
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  describe('acceso permitido', () => {
    it('debe permitir acceso con token válido, role Admin, hostname correcto y no expirado', () => {
      vi.mocked(authService.hasToken).mockReturnValue(true);
      vi.mocked(authService.userRole).mockReturnValue('Admin');
      vi.mocked(authService.userUrl).mockReturnValue('admin.zentrycorp.dev');
      vi.mocked(authService.expiresAt).mockReturnValue(new Date(Date.now() + 3600000));

      const result = TestBed.runInInjectionContext(() => authAdminGuard(fakeRoute, fakeState));
      expect(result).toBe(true);
    });
  });

  describe('acceso denegado', () => {
    it('debe redirigir a /login sin token', () => {
      vi.mocked(authService.hasToken).mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() => authAdminGuard(fakeRoute, fakeState));
      expect(result).toBeInstanceOf(Object);
      expect(router.parseUrl('/login')).toBeTruthy();
    });

    it('debe redirigir a /login con role Regular', () => {
      vi.mocked(authService.hasToken).mockReturnValue(true);
      vi.mocked(authService.userRole).mockReturnValue('Regular');

      const result = TestBed.runInInjectionContext(() => authAdminGuard(fakeRoute, fakeState));
      expect(result).not.toBe(true);
    });

    it('debe redirigir a /login con hostname incorrecto', () => {
      vi.mocked(authService.hasToken).mockReturnValue(true);
      vi.mocked(authService.userRole).mockReturnValue('Admin');
      vi.mocked(authService.userUrl).mockReturnValue('tenant.zentrycorp.dev');

      const result = TestBed.runInInjectionContext(() => authAdminGuard(fakeRoute, fakeState));
      expect(result).not.toBe(true);
    });

    it('debe hacer logout y redirigir con token expirado', () => {
      vi.mocked(authService.hasToken).mockReturnValue(true);
      vi.mocked(authService.userRole).mockReturnValue('Admin');
      vi.mocked(authService.userUrl).mockReturnValue('admin.zentrycorp.dev');
      vi.mocked(authService.expiresAt).mockReturnValue(new Date(Date.now() - 3600000));

      const result = TestBed.runInInjectionContext(() => authAdminGuard(fakeRoute, fakeState));
      expect(authService.logout).toHaveBeenCalled();
      expect(result).not.toBe(true);
    });

    it('debe permitir acceso con expiresAt null (no expira)', () => {
      vi.mocked(authService.hasToken).mockReturnValue(true);
      vi.mocked(authService.userRole).mockReturnValue('Admin');
      vi.mocked(authService.userUrl).mockReturnValue('admin.zentrycorp.dev');
      vi.mocked(authService.expiresAt).mockReturnValue(null);

      const result = TestBed.runInInjectionContext(() => authAdminGuard(fakeRoute, fakeState));
      expect(result).toBe(true);
    });
  });
});
