import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ToastService } from '@core/notifications/toast.service';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { RegistroVacunoReporteResponse } from '../../domain/models/reporte-vacuno.model';
import { RegistroVacunoDetail } from './registro-vacuno-detail';

const registro: RegistroVacunoReporteResponse = {
  vacuno: {
    id: 3597,
    codigo: 'VAC-3597',
    nombre: 'Toro 347',
    fechaNacimiento: '2021-09-18',
    adquisicionPor: 'compra',
    precioCompra: null,
    raza: 'Jersey',
    color: 'Negro con Blanco',
    sexo: 'macho',
    codigoPadre: null,
    codigoMadre: null,
    codigoAbuelo: null,
    codigoAbuela: null,
    granja: 'Establo San Martin',
    distrito: 'Cajamarca',
    provincia: 'Cajamarca',
    departamento: 'Cajamarca',
    procedencia: null,
    aptoPara: null,
    fechaRegistro: '2026-07-09',
    observaciones: 'Registro de prueba',
    fotoUrl: null,
    estado: 'vivo',
    creadoEn: null,
    actualizadoEn: null,
  },
  historial: [],
  downloadUrl: null,
};

describe('RegistroVacunoDetail', () => {
  const facadeMock = {
    registroSignal: signal<RegistroVacunoReporteResponse | null>(registro),
    loadingSignal: signal(false),
    errorSignal: signal<string | null>(null),
    cargarRegistro: vi.fn().mockResolvedValue(undefined),
    generarArchivo: vi.fn(),
  };

  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
    });
    facadeMock.cargarRegistro.mockClear();

    TestBed.configureTestingModule({
      imports: [RegistroVacunoDetail],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: ReporteVacunoFacade, useValue: facadeMock },
        {
          provide: ToastService,
          useValue: { success: vi.fn(), error: vi.fn() },
        },
      ],
    });
  });

  it('mantiene los grupos del reporte usando los componentes visuales del detalle', () => {
    const fixture = TestBed.createComponent(RegistroVacunoDetail);
    fixture.componentRef.setInput('vacunoId', 3597);
    fixture.detectChanges();

    expect(facadeMock.cargarRegistro).toHaveBeenCalledWith(3597);
    expect(fixture.nativeElement.querySelectorAll('zt-vacuno-detail-section')).toHaveLength(4);
    expect(fixture.nativeElement.querySelectorAll('zt-vacuno-detail-field')).toHaveLength(15);
    expect(fixture.nativeElement.querySelector('zt-vacuno-detail-field i')).toBeNull();
    expect(fixture.nativeElement.querySelector('.photo-edit')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('VAC-3597');
    expect(fixture.nativeElement.textContent).toContain('Toro 347');
  });
});
