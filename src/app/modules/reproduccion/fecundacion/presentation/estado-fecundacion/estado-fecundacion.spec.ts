import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';

import { EstadoFecundacionService } from '../../application/services/estado-fecundacion.service';
import { EstadoFecundacionComponent } from './estado-fecundacion';

describe('EstadoFecundacionComponent', () => {
  let component: EstadoFecundacionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EstadoFecundacionService],
    });

    component = TestBed.runInInjectionContext(() => new EstadoFecundacionComponent());
  });

  it('se crea con estados permitidos y un vacuno seleccionado', () => {
    expect(component).toBeTruthy();
    expect(component.estadosPermitidos).toEqual([
      'pendiente',
      'en_proceso',
      'confirmada',
      'en_gestacion',
      'fallida',
      'sin_estado',
    ]);
    expect(component.vacunoSeleccionado()?.codigoVacuno).toBe('VCH-001');
  });

  it('filtra vacunos hembra por codigo o nombre', () => {
    component.actualizarBusqueda('mora');

    expect(component.vacunosFiltrados()).toHaveLength(1);
    expect(component.vacunosFiltrados()[0].codigoVacuno).toBe('VCH-009');

    component.actualizarBusqueda('VCH-004');

    expect(component.vacunosFiltrados()[0].nombreVacuno).toBe('Nieves');
  });

  it('sincroniza el estado editable al seleccionar otro vacuno', () => {
    component.seleccionarVacuno('VCH-009');

    expect(component.vacunoSeleccionado()?.nombreVacuno).toBe('Mora');
    expect(component.estadoSeleccionado()).toBe('fallida');
    expect(component.disponibleNuevaFecundacion()).toBe(true);
  });

  it('actualiza unicamente el estado de fecundacion y conserva los datos originales del registro', () => {
    const original = component.vacunoSeleccionado()?.ultimoRegistroActivo;

    component.actualizarEstado('en_gestacion');
    component.guardarEstado();

    const actualizado = component.vacunoSeleccionado();

    expect(actualizado?.estadoReproductivoActual).toBe('en_gestacion');
    expect(actualizado?.disponibleNuevaFecundacion).toBe(false);
    expect(actualizado?.ultimoRegistroActivo).toEqual(original);
    expect(component.guardado()).toBe(true);
  });

  it('define en el template el selector de estado como control editable del panel de actualizacion', () => {
    const template = readFileSync(
      'src/app/modules/reproduccion/fecundacion/presentation/estado-fecundacion/estado-fecundacion.html',
      'utf8',
    );

    expect(template).toContain('name="estadoFecundacion"');
    expect(template).toContain('(ngSubmit)="guardarEstado()"');
    expect(template).toContain('registro.vacunoReceptor');
    expect(template).toContain('registro.toroDonante');
  });
});
