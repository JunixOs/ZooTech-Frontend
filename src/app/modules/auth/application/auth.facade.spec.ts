import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthFacade } from './auth.facade';
import { AuthApiService } from '../infrastructure/auth-api.service';
import { AuthService } from '@core/auth/auth.service';
import { of, throwError, Subject } from 'rxjs';

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
  };

  const mockAuthService = {
    saveSession: vi.fn(),
  };

  const mockRouter = {
    navigateByUrl: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      hostname: 'admin.zentrycorp.dev',
    } as Location);

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: AuthApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
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
      const fakeToken = createToken({ role: 'Admin', exp: Date.now() / 1000 + 3600 });
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
      const fakeToken = createToken({ role: 'Admin', exp: Date.now() / 1000 + 3600 });
      mockApiService.login.mockReturnValue(of(fakeToken));
      const facade = TestBed.inject(AuthFacade);

      facade.inicioSesionUsuario('admin@mail.com', 'password');

      expect(mockAuthService.saveSession).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/admin');
      expect(facade.isLoading()).toBe(false);
      expect(facade.error()).toBeNull();
    });

    it('debe redirigir a /dashboard en login tenant exitoso', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        ...window.location,
        hostname: 'tenant.zentrycorp.dev',
      } as Location);

      const fakeToken = createToken({ role: 'Regular', exp: Date.now() / 1000 + 3600 });
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
});
