export interface LecheRegistro {
  id: number;
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string;
  litros: number;
  [key: string]: unknown; // Firma de índice para compatibilidad con componentes genéricos
  litrosIdoneos?: number;
  turno?: string;
  encargado?: string;
  observaciones?: string;
}

export interface OrdenioDTO {
  id: number;
  vacunoId: number;
  nombreVacuno: string;
  estadoOrdenioCode: string;
  fechaOrdenio?: string;
  fechaHora?: string;
  cantidadLitros?: number;
  litros?: number;
  codigo?: string;
  encargadoUsuarioId: number;
  encargadoNombre?: string;
  observaciones?: string;
  createdAt?: string;
}

export interface RegistrarLecheRequest {
  codigo: string;
  vacunoId: number;
  encargadoUsuarioId: number;
  fechaHora: string;
  litros: number;
  estadoOrdenioCode: string;
  observaciones: string;
}

export interface LecheVacunoOption {
  id: number;
  codigo: string;
  nombre: string;
  raza?: string;
  ultimoRegistro?: string;
  promedio?: string;
}
export interface UpdateLecheRequest {
  fechaHora?: string;
  encargadoUsuarioId?: number;
  litros?: number;
  estadoOrdenioCode?: string;
  observaciones?: string;
}
export interface ConsultaFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  vacunoId?: string;
  page?: number;
  pageSize?: number;
}

export type ReporteOrdeniosPdfFiltros = Pick<
  ConsultaFiltros,
  'fechaDesde' | 'fechaHasta' | 'vacunoId'
> & {
  estadoOrdenioCode?: string;
};
