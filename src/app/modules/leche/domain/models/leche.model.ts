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
  encargadoUsuarioId: number;
  estadoOrdenioCode: string;
  observaciones?: string;
  litros: number;
}

export interface VacunoSimpleDTO {
  id: number;
  nombre: string;
  raza: string;
  ultimoRegistro: string;
  promedio: string;
}
