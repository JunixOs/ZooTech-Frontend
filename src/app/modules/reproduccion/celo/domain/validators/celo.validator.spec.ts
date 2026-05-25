import { describe, it, expect } from 'vitest';
import { CeloValidator } from './celo.validator';
import { CeloRegistro } from '../models/celo.model';

describe('CeloValidator', () => {
  const registroValido: CeloRegistro = {
    codigoRegistro: 'CEL123',
    fecha: '2026-05-15',
    hora: '14:30:00',
    codigoVacuno: 'VAC045',
    nombreVacuno: 'Clarisa',
    vecesEnCelo: 2,
  };

  it('debe validar un registro de celo correcto', () => {
    const result = CeloValidator.validate(registroValido);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  describe('validaciones de codigoRegistro', () => {
    it('debe fallar si codigoRegistro es vacío', () => {
      const result = CeloValidator.validate({ ...registroValido, codigoRegistro: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors['codigoRegistro']).toContain('obligatorio');
    });

    it('debe fallar si codigoRegistro no empieza con CEL', () => {
      const result = CeloValidator.validate({ ...registroValido, codigoRegistro: 'REG123' });
      expect(result.isValid).toBe(false);
      expect(result.errors['codigoRegistro']).toContain('empezar con CEL');
    });
  });

  describe('validaciones de fecha', () => {
    it('debe fallar si fecha es vacía', () => {
      const result = CeloValidator.validate({ ...registroValido, fecha: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors['fecha']).toContain('obligatoria');
    });

    it('debe fallar si la fecha es inválida', () => {
      const result = CeloValidator.validate({ ...registroValido, fecha: 'fecha-invalida' });
      expect(result.isValid).toBe(false);
      expect(result.errors['fecha']).toContain('no es válido');
    });

    it('debe fallar si la fecha es futura', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2); // Un par de días en el futuro
      const futureDateStr = tomorrow.toISOString().split('T')[0];

      const result = CeloValidator.validate({ ...registroValido, fecha: futureDateStr });
      expect(result.isValid).toBe(false);
      expect(result.errors['fecha']).toContain('futuro');
    });
  });

  describe('validaciones de hora', () => {
    it('debe fallar si hora es vacía', () => {
      const result = CeloValidator.validate({ ...registroValido, hora: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors['hora']).toContain('obligatoria');
    });

    it('debe fallar si la hora tiene formato inválido', () => {
      const result = CeloValidator.validate({ ...registroValido, hora: '14:30' }); // falta segundos
      expect(result.isValid).toBe(false);
      expect(result.errors['hora']).toContain('formato válido de 24 horas');
    });
  });

  describe('validaciones de codigoVacuno', () => {
    it('debe fallar si codigoVacuno es vacío', () => {
      const result = CeloValidator.validate({ ...registroValido, codigoVacuno: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors['codigoVacuno']).toContain('obligatorio');
    });

    it('debe fallar si codigoVacuno no empieza con VAC', () => {
      const result = CeloValidator.validate({ ...registroValido, codigoVacuno: 'COW001' });
      expect(result.isValid).toBe(false);
      expect(result.errors['codigoVacuno']).toContain('empezar con VAC');
    });
  });

  describe('validaciones de nombreVacuno', () => {
    it('debe fallar si nombreVacuno es vacío', () => {
      const result = CeloValidator.validate({ ...registroValido, nombreVacuno: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors['nombreVacuno']).toContain('obligatorio');
    });

    it('debe fallar si nombreVacuno tiene menos de 2 caracteres', () => {
      const result = CeloValidator.validate({ ...registroValido, nombreVacuno: 'A' });
      expect(result.isValid).toBe(false);
      expect(result.errors['nombreVacuno']).toContain('al menos 2 caracteres');
    });
  });

  describe('validaciones de vecesEnCelo', () => {
    it('debe fallar si vecesEnCelo es menor a 1', () => {
      const result = CeloValidator.validate({ ...registroValido, vecesEnCelo: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors['vecesEnCelo']).toContain('mayor o igual a 1');
    });

    it('debe fallar si vecesEnCelo es decimal', () => {
      const result = CeloValidator.validate({ ...registroValido, vecesEnCelo: 1.5 });
      expect(result.isValid).toBe(false);
      expect(result.errors['vecesEnCelo']).toContain('número entero');
    });
  });
});
