export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  paginaActual: number;
  totalPaginas: number;
  limitePorPagina: number;
}
