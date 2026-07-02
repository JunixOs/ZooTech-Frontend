export interface LecheRegistro {
  id: number;
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string;
  litros: number;
  turno?: string;
  nombreCompleto?: string;
  encardoNombre?: string;
  observaciones?: string;
  [key: string]: unknown;
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
  nombreEncargado?: string;
  observaciones?: string;
  createdAt?: string;
}

export interface RegistrarLecheRequest {
  vacunoId: number;
  encargadoUsuarioId: number;
  fechaHora: string;
  litros: number;
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
  encargadoUsuarioId?: String;
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
