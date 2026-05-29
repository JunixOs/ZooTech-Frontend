/**
 * Configuración de un reporte individual para renderizar en un ReportCard.
 */
export interface ReportConfig {
  /** Título del reporte (ej: 'Reporte de celo general') */
  title: string;
  /** Descripción breve del contenido del reporte */
  description: string;
  /** Clase de ícono de Font Awesome (ej: 'fa-table-chart', 'fa-cow') */
  icon: string;
  /** Ruta de navegación al hacer clic en la card (ej: '/reproduccion/celo/reporte-general') */
  route?: string;
  /** Para Navegacion dentro del mismo componete */
  onOpen?: () => void;   
}

/**
 * Rango de fechas emitido por el DateRangeFilterComponent.
 */
export interface DateRange {
  /** Fecha de inicio del filtro (puede ser null si no se seleccionó) */
  start: Date | null;
  /** Fecha de fin del filtro (puede ser null si no se seleccionó) */
  end: Date | null;
}
