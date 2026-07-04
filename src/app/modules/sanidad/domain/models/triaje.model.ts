export interface TriajeDTO {
  id: number;
  codigo: string;
  fechaHora: string;
  vacunoId: number;
  vacunoNombre?: string | null;
  nombreVacuno?: string | null;
  tipoPesoCode: string;
  pesoKg: number;
  observaciones?: string | null;
  estadoRegistroCode?: string;
  estadoTriajeCode?: string;
  encargadoUsuarioId?: number | null;
  nombreEncargado?: string | null;
  createdAt?: string;
}

export interface TriajeRegistro {
  id: number;
  codigo: string;
  fechaHora: string;
  vacunoId: number;
  codigoVacuno?: string;
  vacunoNombre?: string | null;
  tipoPesoCode: string;
  tipoPesoNombre?: string;
  pesoKg: number;
  observaciones?: string | null;
  estadoRegistroCode?: string;
  estadoTriajeCode?: string;
  encargadoUsuarioId?: number | null;
  nombreEncargado?: string | null;
  createdAt?: string;
  [key: string]: unknown;
}

export type Triaje = TriajeRegistro;

export interface TriajeVacunoOption {
  id: number;
  codigo: string;
  nombre: string;
}

export interface TriajeTipoPesoOption {
  code: string;
  nombre: string;
}

export interface RegistrarTriajePayload {
  fechaHora: string;
  vacunoId: number;
  tipoPesoCode: string;
  pesoKg: number;
  observaciones?: string | null;
  estadoRegistroCode: string;
  encargadoUsuarioId?: number | null;
}

export interface ActualizarTriajePayload {
  tipoPesoCode: string;
  pesoKg: number;
  observaciones?: string | null;
  //estadoRegistroCode: string;
}

export interface TriajeHistorialItem {
  id: number;
  fechaHora: string;
  pesoKg: number;
  tipoPesoCode: string;
  observaciones?: string;
}

export interface EliminarTriajePayload {
  motivoEliminacion: string;
}