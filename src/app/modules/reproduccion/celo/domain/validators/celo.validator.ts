import { CeloRegistro } from '../models/celo.model';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class CeloValidator {
  /**
   * Valida las reglas de negocio de un registro de celo.
   * Reglas:
   * - codigoRegistro: Obligatorio, formato CEL seguido de números (ej: CEL001)
   * - fecha: Obligatorio, formato válido, no futuro
   * - hora: Obligatorio, formato 24 horas HH:MM:SS
   * - codigoVacuno: Obligatorio, formato VAC seguido de números (ej: VAC001)
   * - nombreVacuno: Obligatorio, mínimo 2 caracteres
   * - vecesEnCelo: Obligatorio, entero mayor o igual a 1
   */
  static validate(registro: Partial<CeloRegistro>): ValidationResult {
    const errors: Record<string, string> = {};

    // 1. Validar Código de Registro
    if (!registro.codigoRegistro || registro.codigoRegistro.trim() === '') {
      errors['codigoRegistro'] = 'El código de registro es obligatorio.';
    } else if (!/^CEL\d+$/.test(registro.codigoRegistro)) {
      errors['codigoRegistro'] = 'El código de registro debe empezar con CEL y terminar con números (ej. CEL001).';
    }

    // 2. Validar Fecha
    if (!registro.fecha) {
      errors['fecha'] = 'La fecha es obligatoria.';
    } else {
      const regDate = new Date(registro.fecha);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Permitir hasta el final del día de hoy
      if (isNaN(regDate.getTime())) {
        errors['fecha'] = 'El formato de fecha no es válido.';
      } else if (regDate > today) {
        errors['fecha'] = 'La fecha de registro no puede ser del futuro.';
      }
    }

    // 3. Validar Hora
    if (!registro.hora || registro.hora.trim() === '') {
      errors['hora'] = 'La hora es obligatoria.';
    } else if (!/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(registro.hora)) {
      errors['hora'] = 'La hora debe tener un formato válido de 24 horas (HH:MM:SS).';
    }

    // 4. Validar Código del Vacuno
    if (!registro.codigoVacuno || registro.codigoVacuno.trim() === '') {
      errors['codigoVacuno'] = 'El código de vacuno es obligatorio.';
    } else if (!/^VAC\d+$/.test(registro.codigoVacuno)) {
      errors['codigoVacuno'] = 'El código de vacuno debe empezar con VAC y terminar con números (ej. VAC001).';
    }

    // 5. Validar Nombre del Vacuno
    if (!registro.nombreVacuno || registro.nombreVacuno.trim() === '') {
      errors['nombreVacuno'] = 'El nombre de la vaca es obligatorio.';
    } else if (registro.nombreVacuno.trim().length < 2) {
      errors['nombreVacuno'] = 'El nombre del vacuno debe tener al menos 2 caracteres.';
    }

    // 6. Validar Veces en Celo
    if (registro.vecesEnCelo === undefined || registro.vecesEnCelo === null) {
      errors['vecesEnCelo'] = 'El número de veces en celo es obligatorio.';
    } else if (!Number.isInteger(registro.vecesEnCelo) || registro.vecesEnCelo < 1) {
      errors['vecesEnCelo'] = 'La cantidad de veces en celo debe ser un número entero mayor o igual a 1.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
