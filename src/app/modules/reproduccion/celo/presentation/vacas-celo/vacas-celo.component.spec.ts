import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@core/notifications/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { CeloFacade } from '../../application/celo.facade';
import { VacasCeloComponent } from './vacas-celo.component';

describe('VacasCeloComponent', () => {
  let component: VacasCeloComponent;
  let fixture: ComponentFixture<VacasCeloComponent>;
  let facade: {
    vacasEnCelo: ReturnType<typeof signal>;
    cargarVacasEnCelo: ReturnType<typeof vi.fn>;
    registrarCelo: ReturnType<typeof vi.fn>;
  };
  let toast: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    facade = {
      vacasEnCelo: signal([]),
      cargarVacasEnCelo: vi.fn(),
      registrarCelo: vi.fn(() => of({})),
    };
    toast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VacasCeloComponent],
      providers: [
        { provide: CeloFacade, useValue: facade },
        {
          provide: AuthService,
          useValue: { userId: signal(1), userName: signal('Encargado') },
        },
        { provide: ToastService, useValue: toast },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
    })
      .overrideComponent(VacasCeloComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(VacasCeloComponent);
    component = fixture.componentInstance;
    component.nuevoCelo = {
      vacunoId: 1,
      encargadoUsuarioId: 1,
      fechaHora: '2026-07-24T10:00',
      observaciones: '',
      caracteristicaCodes: ['MUGE'],
    };
  });

  it('cierra el modal, recarga la tabla y muestra un toast al registrar un celo', () => {
    component.mostrarModalNuevoCelo.set(true);

    component.guardarNuevoCelo();

    expect(component.mostrarModalNuevoCelo()).toBe(false);
    expect(facade.cargarVacasEnCelo).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledWith('reproduccion.celo.vacas.modal.messages.saved');
  });

  it('mantiene el modal abierto y muestra un toast cuando falla el registro', () => {
    facade.registrarCelo.mockReturnValueOnce(throwError(() => new Error('Error del servidor')));
    component.mostrarModalNuevoCelo.set(true);

    component.guardarNuevoCelo();

    expect(component.mostrarModalNuevoCelo()).toBe(true);
    expect(component.isSubmitting()).toBe(false);
    expect(facade.cargarVacasEnCelo).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Error del servidor');
  });
});
