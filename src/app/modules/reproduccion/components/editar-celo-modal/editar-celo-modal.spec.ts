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

  it('preserva las observaciones y características existentes al abrir la edición', async () => {
    fixture.componentRef.setInput('registro', {
      id: 1,
      codigoRegistro: 'CEL-001',
      fecha: '2026-07-24',
      hora: '10:00',
      codigoVacuno: 'VAC-001',
      nombreVacuno: 'Luna',
      vecesEnCelo: 2,
      observaciones: 'Observación existente',
      caracteristicaCodes: ['MUGE', 'INQUIETA'],
    });
    await fixture.whenStable();

    expect(component.form().observaciones).toBe('Observación existente');
    expect(component.form().caracteristicaCodes).toEqual(['MUGE', 'INQUIETA']);
  });

  it('usa las características del detalle al reabrir el registro', async () => {
    fixture.componentRef.setInput('registro', {
      id: 1,
      codigoRegistro: 'CEL-001',
      fecha: '2026-07-24',
      hora: '10:00',
      codigoVacuno: 'VAC-001',
      nombreVacuno: 'Luna',
      vecesEnCelo: 2,
    });
    fixture.componentRef.setInput('caracteristicaCodes', ['MUGE', 'INQUIETA']);
    await fixture.whenStable();

    expect(component.form().caracteristicaCodes).toEqual(['MUGE', 'INQUIETA']);
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

  it('muestra el resumen reproductivo y formatea las fechas del historial', () => {
    fixture.componentRef.setInput('registro', {
      id: 2,
      codigoRegistro: 'CEL-002',
      fecha: '2026-07-24',
      hora: '10:00',
      codigoVacuno: 'VAC-001',
      nombreVacuno: 'Luna',
      vecesEnCelo: 2,
    });
    fixture.componentRef.setInput('historial', [
      {
        numero: 3,
        fechaHora: '2026-07-22T10:30:00Z',
        resultado: true,
      },
      { numero: 2, fechaHora: '2026-07-21T10:30:00Z', resultado: false },
      { numero: 1, fechaHora: '2026-07-20T10:30:00Z', resultado: null },
    ]);
    fixture.componentRef.setInput('resumen', {
      celos: 2,
      embarazos: 1,
      fecundaciones: 2,
      crias: 1,
      montas: 1,
      inseminaciones: 1,
      ultimoParto: '2026-03-15',
    });

    expect(component.resumen()?.embarazos).toBe(1);
    expect(component.formatFecha('2026-07-24T10:30:00Z')).not.toBe('2026-07-24T10:30:00Z');
    expect(component.historial().map((item) => item.resultado)).toEqual([true, false, null]);
  });
});
