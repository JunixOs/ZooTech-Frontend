import { describe, it, expect } from 'vitest';
import { OrdenioDTO } from '@modules/leche/domain/models/leche.model';
import { LecheMapper } from './leche.mapper';

const baseDTO: OrdenioDTO = {
  id: 1,
  fechaOrdenio: '2026-06-10T08:30:00',
  vacunoId: 5,
  encargadoUsuarioId: 2,
  estadoOrdenioCode: 'ACTIVO',
  cantidadLitros: 12.5,
};

describe('LecheMapper.toDomain', () => {
  it('mapea id, codigo y litros segun el contrato actual', () => {
    const result = LecheMapper.toDomain(baseDTO);

    expect(result.id).toBe(1);
    expect(result.codigoRegistro).toBe('1');
    expect(result.litros).toBe(12.5);
  });

  it('formatea fecha como DD/MM/YYYY', () => {
    const result = LecheMapper.toDomain(baseDTO);

    expect(result.fecha).toBe('10/06/2026');
  });

  it('asigna turno manana para hora menor a 12', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, fechaOrdenio: '2026-06-10T08:00:00' });

    expect(result['turno']).toBe('manana');
  });

  it('asigna turno tarde para hora mayor o igual a 12', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, fechaOrdenio: '2026-06-10T14:00:00' });

    expect(result['turno']).toBe('tarde');
  });

  it('usa vacunoNombre del DTO cuando esta presente', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, vacunoNombre: 'Clarita' });

    expect(result.nombreVacuno).toBe('Clarita');
  });

  it('genera fallback Vacuno X cuando vacunoNombre esta ausente', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, vacunoNombre: undefined });

    expect(result.nombreVacuno).toBe('Vacuno 5');
  });

  it('usa encargadoNombre del DTO cuando esta presente', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, encargadoNombre: 'Juan Lopez' });

    expect(result['encargado']).toBe('Juan Lopez');
  });

  it('genera fallback Usuario X cuando encargadoNombre esta ausente', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, encargadoNombre: undefined });

    expect(result['encargado']).toBe('Usuario 2');
  });

  it('genera encargado vacio cuando encargadoUsuarioId es 0', () => {
    const result = LecheMapper.toDomain({
      ...baseDTO,
      encargadoNombre: undefined,
      encargadoUsuarioId: 0,
    });

    expect(result['encargado']).toBe('');
  });

  it('asigna observaciones vacias cuando no vienen en el DTO', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, observaciones: undefined });

    expect(result['observaciones']).toBe('');
  });

  it('toDomainList mapea un array completo', () => {
    const result = LecheMapper.toDomainList([baseDTO, { ...baseDTO, id: 2 }]);

    expect(result).toHaveLength(2);
    expect(result[1].codigoRegistro).toBe('2');
  });
});
