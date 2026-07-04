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
  /** Prefijo opcional para traducciones (ej: 'vacunos.status') */
  translatePrefix?: string;
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
 * Evento emitido al filtrar por una columna concreta.
 */
export interface ColumnFilterEvent {
  columnKey: string;
  value: string;
}
