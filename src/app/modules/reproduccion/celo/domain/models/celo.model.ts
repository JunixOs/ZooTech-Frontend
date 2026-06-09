/**
 * Representa un registro de celo de una vaca.
 */
export interface CeloRegistro {
  /** ID numérico del backend (requerido para editar/eliminar) */
  id?: number;
  /** Código único del registro de celo */
  codigoRegistro: string;
  /** Fecha en que se realizó el registro */
  fecha: string;
  /** Hora en que se realizó el registro */
  hora: string;
  /** Código del vacuno al que se le registró el celo */
  codigoVacuno: string;
  /** Nombre del vacuno */
  nombreVacuno: string;
  /** Número de veces que ha estado en celo (incluyendo la actual) */
  vecesEnCelo: number;
}

/**
 * Payload requerido por el backend para registrar un nuevo celo.
 */
export interface RegistrarCeloRequest {
  vacunoId: number;
  encargadoUsuarioId: number;
  fechaHora: string;
  observaciones: string;
  caracteristicaCodes: string[];
}
