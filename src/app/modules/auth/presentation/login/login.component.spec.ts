import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthFacade } from '@modules/auth/application/auth.facade';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const mockAuthFacade = {
    isLoading: vi.fn().mockReturnValue(false),
    error: vi.fn().mockReturnValue(null),
    inicioSesionUsuario: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        { provide: AuthFacade, useValue: mockAuthFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('creación', () => {
    it('debe crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar loginData vacío', () => {
      expect(component.loginData.email).toBe('');
      expect(component.loginData.password).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('debe llamar a authFacade.inicioSesionUsuario al enviar formulario', () => {
      component.loginData.email = 'admin@mail.com';
      component.loginData.password = 'password123';

      component.onSubmit();

      expect(mockAuthFacade.inicioSesionUsuario).toHaveBeenCalledWith(
        'admin@mail.com',
        'password123'
      );
    });
  });

  describe('template', () => {
    it('debe renderizar el formulario de login', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('form')).toBeTruthy();
      expect(el.querySelector('input[type="email"]')).toBeTruthy();
      expect(el.querySelector('input[type="password"]')).toBeTruthy();
      expect(el.querySelector('button[type="submit"]')).toBeTruthy();
    });

    it('debe tener two-way binding en los inputs', () => {
      const emailInput = fixture.nativeElement.querySelector('input[name="email"]');
      const passwordInput = fixture.nativeElement.querySelector('input[name="password"]');

      emailInput.value = 'test@mail.com';
      emailInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.loginData.email).toBe('test@mail.com');
    });

    it('debe mostrar los labels traducidos', () => {
      const el = fixture.nativeElement as HTMLElement;
      const labels = el.querySelectorAll('label');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('debe tener el botón de submit deshabilitado cuando el formulario es inválido', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      
      const form = fixture.nativeElement.querySelector('form');
      expect(form.classList.contains('ng-invalid')).toBe(true);
    });

    it('debe habilitar el botón cuando el formulario es válido', async () => {
      const emailInput = fixture.nativeElement.querySelector('input[name="email"]');
      const passwordInput = fixture.nativeElement.querySelector('input[name="password"]');

      emailInput.value = 'test@mail.com';
      emailInput.dispatchEvent(new Event('input'));
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await fixture.whenStable();
      fixture.detectChanges();

      const form = fixture.nativeElement.querySelector('form');
      expect(form.classList.contains('ng-valid')).toBe(true);
    });
  });
});
