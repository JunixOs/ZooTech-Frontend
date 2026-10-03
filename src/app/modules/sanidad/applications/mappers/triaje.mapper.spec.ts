import { describe, expect, it } from 'vitest';
import { TriajeDTO, TriajeRegistro } from '@modules/sanidad/domain/models/triaje.model';
import { TriajeMapper } from './triaje.mapper';

describe('TriajeMapper', () => {
  it('mapea DTO a dominio usando fallbacks de nombre, codigo, estado y nulos', () => {
    const dto: TriajeDTO = {
      id: 7,
      codigo: undefined as unknown as string,
      fechaHora: '2026-07-22T10:30:00',
      vacunoId: 15,
      nombreVacuno: 'Luna',
      tipoPesoCode: 'CONTROL',
      pesoKg: 125.5,
      estadoTriajeCode: 'ACTIVO',
    };

    const result = TriajeMapper.toDomain(dto);

    expect(result).toEqual({
      id: 7,
      codigo: '7',
      fechaHora: '2026-07-22T10:30:00',
      vacunoId: 15,
      codigoVacuno: '15',
      vacunoNombre: 'Luna',
      tipoPesoCode: 'CONTROL',
      pesoKg: 125.5,
      observaciones: null,
      estadoRegistroCode: 'ACTIVO',
      estadoTriajeCode: 'ACTIVO',
      encargadoUsuarioId: null,
      nombreEncargado: null,
      createdAt: undefined,
    });
  });

  it('mapea una lista de DTOs a dominio', () => {
    const dtos: TriajeDTO[] = [
      {
        id: 1,
        codigo: 'TRI-001',
        fechaHora: '2026-07-22T10:30:00',
        vacunoId: 5,
        vacunoNombre: 'Estrella',
        tipoPesoCode: 'CONTROL',
        pesoKg: 120,
      },
      {
        id: 2,
        codigo: 'TRI-002',
        fechaHora: '2026-07-23T10:30:00',
        vacunoId: 6,
        vacunoNombre: 'Rosa',
        tipoPesoCode: 'SALIDA',
        pesoKg: 121,
      },
    ];

    const result = TriajeMapper.toDomainList(dtos);

    expect(result).toHaveLength(2);
    expect(result[0].codigo).toBe('TRI-001');
    expect(result[1].vacunoNombre).toBe('Rosa');
  });

  it('mapea dominio parcial a DTO parcial', () => {
    const domain: Partial<TriajeRegistro> = {
      codigo: 'TRI-003',
      fechaHora: '2026-07-24T10:30:00',
      vacunoId: 8,
      tipoPesoCode: 'CONTROL',
      pesoKg: 130,
      observaciones: 'Sin novedad',
      estadoRegistroCode: 'ACTIVO',
      encargadoUsuarioId: 10,
    };

    expect(TriajeMapper.toDTO(domain)).toEqual({
      codigo: 'TRI-003',
      fechaHora: '2026-07-24T10:30:00',
      vacunoId: 8,
      tipoPesoCode: 'CONTROL',
      pesoKg: 130,
      observaciones: 'Sin novedad',
      estadoTriajeCode: 'ACTIVO',
      encargadoUsuarioId: 10,
    });
  });
});
