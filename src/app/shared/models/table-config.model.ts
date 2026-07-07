/**
 * Configuración de una columna para zt-data-table.
 */
export interface ColumnConfig {
  /** Clave de la propiedad en el objeto de datos (ej: 'codigo', 'nombre') */
  key: string;
  /** Clave de i18n para el título de la columna (ej: 'shared.table.code') */
  headerKey: string;
  /** Indica si la columna es ordenable */
  sortable?: boolean;
  /** Indica si la columna tiene filtro propio */
  filterable?: boolean;
  /** Tipo de filtro a renderizar en el header (default: 'text') */
  filterType?: 'text' | 'toggle';
  /** Opciones cuando filterType es 'toggle' */
  filterOptions?: { label: string; value: string }[];
  /** Tipo visual de la celda (default: 'text') */
  type?: 'text' | 'badge' | 'date';
  /** Ancho de la columna (CSS, ej: '120px', '1fr') */
  width?: string;
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right';
  /** Prefijo de traducción dinámico para los valores de la celda */
  translatePrefix?: string;
  /** Mapa personalizado de clases CSS para badges según el valor */
  badgeColorMap?: Record<string, string>;
}

/**
 * Evento emitido al cambiar la página.
 */
export interface PageChangeEvent {
  page: number;
  pageSize: number;
}

/**
 * Evento emitido al filtrar por columna.
 */
export interface ColumnFilterEvent {
  columnKey: string;
  value: string;
}
