export interface LecheRegistro {
  id: number;
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string;
  litros: number;
  [key: string]: unknown; // Firma de índice para compatibilidad con componentes genéricos
}

export interface OrdenioDTO {
  id: number;
  vacunoId: number;
  vacunoNombre?: string;
  estadoOrdenioCode: string;
  fechaOrdenio: string;
  cantidadLitros: number;
  encargadoUsuarioId: number;
  encargadoNombre?: string;
  observaciones?: string;
  createdAt?: string;
}

export interface RegistrarLecheRequest {
  vacunoId: number;
  encargadoUsuarioId: number;
  fechaHora: string;
  litros: number;
  observaciones?: string;
}

export interface LecheVacunoOption {
  id: number;
  codigo: string;
  nombre: string;
  raza?: string;
  ultimoRegistro?: string;
  promedio?: string;
}

export interface ConsultaFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  vacunoId?: string;
  page?: number;
  pageSize?: number;
}
