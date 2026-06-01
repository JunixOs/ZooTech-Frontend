/**
 * Representa un registro de celo de una vaca.
 */
export interface CeloRegistro {
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
