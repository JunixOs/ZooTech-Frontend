import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EstadoFecundacionService } from '../../application/services/estado-fecundacion.service';
import { EstadoFecundacionComponent } from './estado-fecundacion';

const vacunos = signal([
  { id: 1, codigoVacuno: 'VAC-001', nombreVacuno: 'Luna', raza: 'Jersey' },
  { id: 3, codigoVacuno: 'VAC-003', nombreVacuno: 'Mora', raza: 'Holstein' },
]);

const estadoActual = signal({
  vacunoId: 1,
  fecundacionId: 9,
  codigoVacuno: 'VAC-001',
  nombreVacuno: 'Luna',
  raza: 'Jersey',
  estadoReproductivoActual: 'pendiente' as const,
  disponibleNuevaFecundacion: false,
  ultimaActualizacion: '2026-07-01',
  ultimoRegistroActivo: {
    codigoRegistro: 'FEC-009',
    activo: true,
    tipoFecundacion: 'IA' as const,
    vacunoReceptor: 'VAC-001 - Luna',
    toroDonante: 'TOR-001 - Atlas',
    fechaProcedimiento: '2026-06-30',
    responsable: 'Dra. Ana Torres',
    resultadoRegistrado: 'Pendiente',
    observacionesVeterinarias: 'Control programado',
  },
});

const serviceMock = {
  vacunosHembra: vacunos.asReadonly(),
  estadoActual: estadoActual.asReadonly(),
  loading: signal(false).asReadonly(),
  saving: signal(false).asReadonly(),
  error: signal('').asReadonly(),
  saveMessage: signal('').asReadonly(),
  cargarVacunosHembra: vi.fn(() => Promise.resolve()),
  consultarEstado: vi.fn(() => Promise.resolve()),
  actualizarEstado: vi.fn(() => Promise.resolve()),
  buscarVacunosHembra: vi.fn((term: string) => {
    const normalized = term.trim().toLowerCase();
    return normalized
      ? vacunos().filter((item) => item.codigoVacuno.toLowerCase().includes(normalized) || item.nombreVacuno.toLowerCase().includes(normalized))
      : vacunos();
  }),
  esDisponibleParaNuevaFecundacion: vi.fn((estado: string) => estado === 'fallida' || estado === 'sin_estado'),
};

describe('EstadoFecundacionComponent', () => {
  let component: EstadoFecundacionComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: EstadoFecundacionService, useValue: serviceMock }],
    });

    component = TestBed.runInInjectionContext(() => new EstadoFecundacionComponent());
  });

  it('carga vacunos hembra y sincroniza el estado editable', async () => {
    await component.ngOnInit();

    expect(serviceMock.cargarVacunosHembra).toHaveBeenCalled();
    expect(component.vacunoIdSeleccionado()).toBe(1);
    expect(component.estadoSeleccionado()).toBe('pendiente');
  });

  it('filtra vacunos hembra por codigo o nombre', () => {
    component.actualizarBusqueda('mora');

    expect(component.vacunosFiltrados()).toEqual([{ id: 3, codigoVacuno: 'VAC-003', nombreVacuno: 'Mora', raza: 'Holstein' }]);
  });

  it('consulta estado al seleccionar un vacuno', async () => {
    await component.seleccionarVacuno(3);

    expect(component.vacunoIdSeleccionado()).toBe(3);
    expect(serviceMock.consultarEstado).toHaveBeenCalledWith(3);
  });

  it('guarda unicamente el estado de fecundacion seleccionado', async () => {
    component.actualizarEstado('confirmada');
    await component.guardarEstado();

    expect(serviceMock.actualizarEstado).toHaveBeenCalledWith('confirmada');
  });

  it('define en el template solo el selector de estado como control editable de actualizacion', () => {
    const template = readFileSync(
      'src/app/modules/reproduccion/fecundacion/presentation/estado-fecundacion/estado-fecundacion.html',
      'utf8',
    );

    expect(template).toContain('name="estadoFecundacion"');
    expect(template).toContain('(ngSubmit)="guardarEstado()"');
    expect(template).toContain('registro.vacunoReceptor');
    expect(template).toContain('registro.toroDonante');
    expect(template).not.toContain('name="tipoFecundacion"');
    expect(template).not.toContain('name="responsable"');
  });
});
