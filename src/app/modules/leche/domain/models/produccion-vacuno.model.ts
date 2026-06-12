/**
 * Representa una fila agrupada por vacuno para el reporte de producción por vacuno.
 */
export interface ProduccionVacuno {
  /** Código único del vacuno */
  codigoVacuno: string;
  /** Nombre del vacuno */
  nombreVacuno: string;
  /** Fecha del último ordeño en el rango seleccionado ('DD/MM/YYYY') */
  ultimaFecha: string;
  /** Total de litros producidos en el rango seleccionado */
  litros: number;
  /** Firma de índice para compatibilidad con componentes genéricos (tabla) */
  [key: string]: unknown;
}

/**
 * Representa un punto de datos para el gráfico de detalle por vacuno.
 */
export interface ChartPoint {
  /** Fecha del registro ('DD/MM/YYYY') */
  fecha: string;
  /** Etiqueta para mostrar en el eje X */
  label: string;
  /** Valor real registrado */
  real: number;
  /** Valor de predicción estimado */
  prediccion: number;
}
