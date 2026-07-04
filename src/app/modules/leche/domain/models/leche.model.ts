export interface LecheRegistro {
  id: number;
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string;
  litros: number;
  turno?: string;
  encargado?: string;
  observaciones?: string;
  [key: string]: unknown;
}

export interface OrdenioDTO {
  id: number;
  vacunoId: number;
  vacunoNombre?: string;
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
