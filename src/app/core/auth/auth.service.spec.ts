import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { LocalStorage } from '@core/store/local.store';
import { JwtSession } from '@modules/auth/domain/auth.model';

describe('AuthService', () => {
  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: LocalStorage, useValue: mockStorage },
      ],
    });
  });

  describe('inicialización', () => {
    it('debe iniciar sin sesión si no hay datos en storage', () => {
      mockStorage.getItem.mockReturnValue(null);
      const service = TestBed.inject(AuthService);

      expect(service.isAuthenticated()).toBe(false);
      expect(service.userRole()).toBeNull();
      expect(service.expiresAt()).toBeNull();
      expect(service.userUrl()).toBeNull();
    });

    it('debe restaurar sesión desde storage si existe', () => {
      const storedSession = {
        token: 'test-token',
        role: 'Admin',
        hostname: 'admin.zentrycorp.dev',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };
      mockStorage.getItem.mockReturnValue(storedSession);

      const service = TestBed.inject(AuthService);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.userRole()).toBe('Admin');
      expect(service.userUrl()).toBe('admin.zentrycorp.dev');
    });
  });

  describe('saveSession', () => {
    it('debe guardar token y sesión en storage', () => {
      const service = TestBed.inject(AuthService);
      const session: JwtSession = {
        token: 'new-token',
        role: 'Regular',
        expiresAt: new Date(Date.now() + 3600000),
        hostname: 'tenant.zentrycorp.dev',
        userId: 7,
        userName: 'Junior Silva',
      };

      service.saveSession(session);

      expect(mockStorage.setItem).toHaveBeenCalledWith('access_token', 'new-token');
      expect(mockStorage.setItem).toHaveBeenCalledWith('auth_session', session);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.userRole()).toBe('Regular');
    });
  });

  describe('getToken', () => {
    it('debe devolver el token del storage', () => {
      mockStorage.getItem.mockReturnValue('stored-token');
      const service = TestBed.inject(AuthService);

      expect(service.getToken()).toBe('stored-token');
    });

    it('debe devolver null si no hay token', () => {
      mockStorage.getItem.mockReturnValue(null);
      const service = TestBed.inject(AuthService);

      expect(service.getToken()).toBeNull();
    });
  });

  describe('hasToken', () => {
    it('debe devolver true si hay token', () => {
      mockStorage.getItem.mockReturnValue('token');
      const service = TestBed.inject(AuthService);

      expect(service.hasToken()).toBe(true);
    });

    it('debe devolver false si no hay token', () => {
      mockStorage.getItem.mockReturnValue(null);
      const service = TestBed.inject(AuthService);

      expect(service.hasToken()).toBe(false);
    });
  });

  describe('logout', () => {
    it('debe limpiar storage y signals', () => {
      const service = TestBed.inject(AuthService);

      service.saveSession({
        token: 'token',
        role: 'Admin',
        expiresAt: new Date(),
        hostname: 'admin.zentrycorp.dev',
        userId: 42,
        userName: 'Paul Tarazona',
      });

      service.logout();

      expect(mockStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('auth_session');
      expect(service.isAuthenticated()).toBe(false);
      expect(service.userRole()).toBeNull();
      expect(service.expiresAt()).toBeNull();
      expect(service.userUrl()).toBeNull();
    });
  });
});
