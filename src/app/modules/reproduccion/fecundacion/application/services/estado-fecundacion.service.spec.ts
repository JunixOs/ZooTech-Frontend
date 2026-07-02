import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { EstadoFecundacionService } from './estado-fecundacion.service';

describe('EstadoFecundacionService', () => {
  let service: EstadoFecundacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EstadoFecundacionService],
    });

    service = TestBed.inject(EstadoFecundacionService);
  });

  it('lista vacunos hembra con informacion de estado de fecundacion', () => {
    const vacunos = service.listarVacunosHembra();

    expect(vacunos.length).toBeGreaterThan(0);
    expect(vacunos[0].codigoVacuno).toBe('VCH-001');
    expect(vacunos[0].ultimoRegistroActivo?.vacunoReceptor).toBe('VCH-001 - Luna');
  });

  it('busca vacunos hembra por codigo o nombre', () => {
    expect(service.buscarVacunosHembra('mora')).toHaveLength(1);
    expect(service.buscarVacunosHembra('VCH-004')[0].nombreVacuno).toBe('Nieves');
  });

  it('aplica la regla de disponibilidad para nueva fecundacion', () => {
    expect(service.esDisponibleParaNuevaFecundacion('fallida')).toBe(true);
    expect(service.esDisponibleParaNuevaFecundacion('sin_estado')).toBe(true);
    expect(service.esDisponibleParaNuevaFecundacion('pendiente')).toBe(false);
    expect(service.esDisponibleParaNuevaFecundacion('en_proceso')).toBe(false);
    expect(service.esDisponibleParaNuevaFecundacion('confirmada')).toBe(false);
    expect(service.esDisponibleParaNuevaFecundacion('en_gestacion')).toBe(false);
  });

  it('actualiza solo el estado de fecundacion y conserva el registro original', () => {
    const original = service.obtenerPorCodigo('VCH-001')?.ultimoRegistroActivo;

    const actualizado = service.actualizarEstado('VCH-001', 'fallida');

    expect(actualizado?.estadoReproductivoActual).toBe('fallida');
    expect(actualizado?.disponibleNuevaFecundacion).toBe(true);
    expect(actualizado?.ultimoRegistroActivo).toEqual(original);
  });
});
