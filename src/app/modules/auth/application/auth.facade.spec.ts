import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthFacade } from './auth.facade';
import { AuthApiService } from '../infrastructure/auth-api.service';
import { AuthService } from '@core/auth/auth.service';
import { of, throwError, Subject } from 'rxjs';
import * as appContext from '@core/auth/app-context';

vi.mock('@core/auth/app-context', () => ({
  getCurrentHostname: vi.fn(),
  getAppContextFromHostname: vi.fn((hostname: string) => {
    if (hostname === 'admin.zentrycorp.dev') return 'admin';
    if (hostname.endsWith('.zentrycorp.dev')) return 'tenant';
    return 'unknown';
  }),
}));

function createToken(payload: Record<string, unknown>): string {
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `header.${encodedPayload}.signature`;
}

describe('AuthFacade', () => {
  const mockApiService = {
    login: vi.fn(),
    logout: vi.fn(),
  };

  const mockAuthService = {
    saveSession: vi.fn(),
    logout: vi.fn(),
  };

  const mockRouter = {
    navigateByUrl: vi.fn(),
  };

  const mockTranslateService = {
    instant: vi.fn((key: string) => key),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(appContext.getCurrentHostname).mockReturnValue('admin.zentrycorp.dev');

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: AuthApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });
  });

  describe('inicioSesionUsuario', () => {
    it('debe setear isLoading en true al iniciar login', () => {
      const loginSubject = new Subject<string>();
      mockApiService.login.mockReturnValue(loginSubject.asObservable());
      const facade = TestBed.inject(AuthFacade);

      facade.inicioSesionUsuario('admin@mail.com', 'password');

      expect(facade.isLoading()).toBe(true);
      
      loginSubject.complete();
    });

    it('debe llamar a api.login con credenciales correctas', () => {
      const fakeToken = createToken({
        role: 'Admin',
        exp: Date.now() / 1000 + 3600,
        sub: '42',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Paul Tarazona',
      });
      mockApiService.login.mockReturnValue(of(fakeToken));
      const facade = TestBed.inject(AuthFacade);

      facade.inicioSesionUsuario('admin@mail.com', 'password');

      expect(mockApiService.login).toHaveBeenCalledWith(
        'admin@mail.com',
        'password',
        'admin.zentrycorp.dev'
      );
    });

    it('debe guardar sesión y redirigir a /admin en login exitoso', () => {
      const fakeToken = createToken({
        role: 'Admin',
        exp: Date.now() / 1000 + 3600,
        sub: '42',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Paul Tarazona',
      });
      mockApiService.login.mockReturnValue(of(fakeToken));
      const facade = TestBed.inject(AuthFacade);

      facade.inicioSesionUsuario('admin@mail.com', 'password');

      expect(mockAuthService.saveSession).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/admin');
      expect(facade.isLoading()).toBe(false);
      expect(facade.error()).toBeNull();
    });

    it('debe redirigir a /dashboard en login tenant exitoso', () => {
      vi.mocked(appContext.getCurrentHostname).mockReturnValue('tenant.zentrycorp.dev');

      const fakeToken = createToken({
        role: 'Regular',
        exp: Date.now() / 1000 + 3600,
        sub: '7',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Junior Silva',
      });
      mockApiService.login.mockReturnValue(of(fakeToken));
      const facade = TestBed.inject(AuthFacade);

      facade.inicioSesionUsuario('user@mail.com', 'password');

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('debe setear error y isLoading en false en login fallido', () => {
      mockApiService.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));
      const facade = TestBed.inject(AuthFacade);

      facade.inicioSesionUsuario('admin@mail.com', 'wrong-password');

      expect(facade.error()).toBe('Invalid credentials');
      expect(facade.isLoading()).toBe(false);
      expect(mockAuthService.saveSession).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('debe llamar al endpoint, limpiar sesión y redirigir al login', () => {
      mockApiService.logout.mockReturnValue(of(undefined));
      const facade = TestBed.inject(AuthFacade);

      facade.logout();

      expect(mockApiService.logout).toHaveBeenCalled();
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
    });

    it('debe limpiar sesión y redirigir aunque falle el endpoint', () => {
      mockApiService.logout.mockReturnValue(throwError(() => new Error('Logout failed')));
      const facade = TestBed.inject(AuthFacade);

      facade.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
    });
  });
});
