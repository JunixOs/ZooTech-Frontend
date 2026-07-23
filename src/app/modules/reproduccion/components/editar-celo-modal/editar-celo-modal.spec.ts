import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCeloModal } from './editar-celo-modal';

describe('EditarCeloModal', () => {
  let component: EditarCeloModal;
  let fixture: ComponentFixture<EditarCeloModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarCeloModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarCeloModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no debe emitir guardar si caracteristicaCodes esta vacio y debe establecer errorMensaje', () => {
    let guardo = false;
    component.guardar.subscribe(() => {
      guardo = true;
    });

    component.onGuardar();

    expect(guardo).toBe(false);
    expect(component.errorMensaje()).toBe(
      'reproduccion.celo.vacas.modal.validation.characteristicsRequired',
    );
  });

  it('debe emitir guardar cuando hay al menos una caracteristica seleccionada', () => {
    let guardadoPayload: any = null;
    component.guardar.subscribe((payload) => {
      guardadoPayload = payload;
    });

    component.toggleCaracteristica('MUGE', true);
    component.onGuardar();

    expect(component.errorMensaje()).toBeNull();
    expect(guardadoPayload).toBeTruthy();
    expect(guardadoPayload.caracteristicaCodes).toContain('MUGE');
  });
});
