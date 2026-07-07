export interface LecheRegistro {
  id: number;
  vacunoId?: string;
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string | null;
  litros: number;
  turno?: string;
  encargado: string;
  observaciones?: string;
  [key: string]: unknown;
}

export interface OrdenioDTO {
  id: number;
  vacunoId: number;
  nombreVacuno: string | null;
  estadoOrdenioCode: string;
  fechaOrdenio?: string;
  fechaHora?: string;
  cantidadLitros?: number;
  litros?: number;
  codigo?: string;
  encargadoUsuarioId: number;
  nombreEncargado?: string | null;
  observaciones?: string | null;
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
  comparativo?: boolean;
}

export interface VacunoSequia {
  vacunoId?: string;
  codigoVacuno: string;
  nombreVacuno: string | null;
  desde?: string;
  probablementeDesde?: string;
  probablementeHasta?: string;
  hasta?: string;
  [key: string]: string | null | undefined;
}

export interface VacasSequiaResponse {
  actuales: VacunoSequia[];
  futuros: VacunoSequia[];
  historicos: VacunoSequia[];
}

export type ReporteOrdeniosPdfFiltros = Pick<
  ConsultaFiltros,
  'fechaDesde' | 'fechaHasta' | 'vacunoId'
> & {
  estadoOrdenioCode?: string;
  comparativo?: boolean;
};
