import { describe, it, expect } from 'vitest';
import { LecheMapper } from './leche.mapper';
import { OrdenioDTO } from '@modules/leche/domain/models/leche.model';

const baseDTO: OrdenioDTO = {
  id: 1,
  codigo: 'ORD-001',
  fechaHora: '2026-06-10T08:30:00',
  nombreVacuno: 'Estrella',
  vacunoId: 5,
  encargadoUsuarioId: 2,
  nombreEncargado: 'Juan López',
  estadoOrdenioCode: 'ACTIVO',
  litros: 12.5,
};

describe('LecheMapper.toDomain', () => {
  it('mapea id y codigo correctamente', () => {
    const result = LecheMapper.toDomain(baseDTO);
    expect(result.id).toBe(1);
    expect(result.codigoRegistro).toBe('ORD-001');
    expect(result.litros).toBe(12.5);
  });

  it('formatea fecha como DD/M/YYYY', () => {
    const result = LecheMapper.toDomain(baseDTO);
    expect(result.fecha).toBe('10/6/2026');
  });

  it('asigna turno manana para hora < 12', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, fechaHora: '2026-06-10T08:00:00' });
    expect(result.turno).toBe('manana');
  });

  it('asigna turno tarde para hora >= 12', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, fechaHora: '2026-06-10T14:00:00' });
    expect(result.turno).toBe('tarde');
  });

  it('usa vacunoNombre del DTO cuando está presente', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, nombreVacuno: 'Estrella' });
    expect(result.nombreVacuno).toBe('Estrella');
  });

  it('genera fallback "Vacuno X" cuando vacunoNombre está ausente', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, nombreVacuno: null });
    expect(result.nombreVacuno).toBe('Vacuno 5');
  });

  it('usa nombreEncargado del DTO cuando está presente', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, nombreEncargado: 'Juan López' });
    expect(result.encargado).toBe('Juan López');
  });

  it('genera fallback "Usuario X" cuando nombreEncargado está ausente', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, nombreEncargado: null });
    expect(result.encargado).toBe('Usuario 2');
  });

  it('genera encargado vacío cuando encargadoUsuarioId es 0', () => {
    const result = LecheMapper.toDomain({
      ...baseDTO,
      nombreEncargado: undefined,
      encargadoUsuarioId: 0,
    });
    expect(result.encargado).toBe('');
  });

  it('asigna observaciones vacías cuando no vienen en el DTO', () => {
    const result = LecheMapper.toDomain({ ...baseDTO, observaciones: undefined });
    expect(result.observaciones).toBe('');
  });

  it('conserva campos necesarios para actualizaciones', () => {
    const result = LecheMapper.toDomain(baseDTO);
    expect(result['encargadoUsuarioId']).toBe(2);
    expect(result['estadoOrdenioCode']).toBe('ACTIVO');
    expect(result['fechaHora']).toBe('2026-06-10T08:30:00');
  });

  it('toDomainList mapea un array completo', () => {
    const dtos = [baseDTO, { ...baseDTO, id: 2, codigo: 'ORD-002' }];
    const result = LecheMapper.toDomainList(dtos);
    expect(result).toHaveLength(2);
    expect(result[1].codigoRegistro).toBe('ORD-002');
  });
});

describe('LecheMapper.toDTO', () => {
  it('convierte fecha DD/M/YYYY a ISO válido', () => {
    const result = LecheMapper.toDTO({ codigoRegistro: 'ORD-001', fecha: '10/6/2026', litros: 8 });
    expect(result.fechaHora).toBeDefined();
    const parsed = new Date(result.fechaHora!);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(5); // 0-indexed: junio = 5
    expect(parsed.getDate()).toBe(10);
  });

  it('deja fechaHora como undefined cuando fecha no viene', () => {
    const result = LecheMapper.toDTO({ codigoRegistro: 'ORD-001', litros: 8 });
    expect(result.fechaHora).toBeUndefined();
  });

  it('mapea codigo y litros correctamente', () => {
    const result = LecheMapper.toDTO({ codigoRegistro: 'ORD-XYZ', litros: 15.3 });
    expect(result.codigo).toBe('ORD-XYZ');
    expect(result.litros).toBe(15.3);
  });

  it('round-trip: toDomain → toDTO produce fecha ISO parseable al mismo día', () => {
    const domain = LecheMapper.toDomain(baseDTO);
    const dto = LecheMapper.toDTO(domain);
    const parsed = new Date(dto.fechaHora!);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(5);
    expect(parsed.getDate()).toBe(10);
  });
});
