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
  /** Ancho de la columna (CSS, ej: '120px', '1fr') */
  width?: string;
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right';
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
