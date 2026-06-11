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
  codigo: string;
  fechaHora: string;
  vacunoId: number;
  vacunoNombre?: string;
  encargadoUsuarioId: number;
  encargadoNombre?: string;
  estadoOrdenioCode: string;
  observaciones?: string;
  litros: number;
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
