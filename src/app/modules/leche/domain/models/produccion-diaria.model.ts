/**
 * Representa un registro individual para el reporte de producción diaria de leche.
 */
export interface ProduccionDiariaRegistro {
  /** Código único del registro de ordeño */
  codigoRegistro: string;
  /** Fecha en que se realizó el ordeño */
  fecha: string;
  /** Hora en que se realizó el ordeño */
  hora: string;
  /** Nombre del vacuno */
  nombreVacuno: string;
  /** Código del vacuno (puede repetirse en distintos días/ordeños) */
  codigoVacuno: string;
  /** Cantidad de leche extraída en litros */
  litros: number;
  /** Firma de índice para compatibilidad con componentes genéricos (tabla) */
  [key: string]: unknown;
}
