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

export interface ProduccionDiariaRegistro {
  codigoRegistro: string;
  fecha: string;
  hora: string;
  nombreVacuno: string;
  codigoVacuno: string;
  litros: number;
  [key: string]: unknown;
}

export interface ProduccionVacuno {
  codigoVacuno: string;
  nombreVacuno: string;
  ultimaFecha: string;
  litros: number;
  [key: string]: unknown;
}

export interface ChartPoint {
  fecha: string;
  label: string;
  real: number;
  prediccion: number;
}

export interface VacunoSequia {
  codigoVacuno: string;
  nombreVacuno: string;
  desde?: string;
  probablementeDesde?: string;
  probablementeHasta?: string;
  hasta?: string;
  [key: string]: unknown;
}

export interface VacasSequiaResponse {
  actuales: VacunoSequia[];
  futuros: VacunoSequia[];
  historicos: VacunoSequia[];
}
