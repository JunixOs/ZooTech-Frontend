import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';

import { LecheDetail } from './leche-detail';

describe('LecheDetail', () => {
  let component: LecheDetail;
  let fixture: ComponentFixture<LecheDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecheDetail],
      providers: [
        {
          provide: LecheFacade,
          useValue: {
            registros: signal([]),
            cargarRegistroPorId: async () => ({
              id: 1,
              codigoRegistro: '1',
              fecha: '10/06/2026',
              hora: '08:00',
              codigoVacuno: '3',
              nombreVacuno: 'Clarita',
              litros: 10,
            }),
            cargarRegistros: async () => undefined,
            eliminarRegistro: async () => undefined,
            actualizarRegistro: async () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LecheDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
