export interface Triaje {
  id: number;
  codigo: string;
  fechaHora: string;
  vacunoId: number;
  tipoPesoCode: string;
  pesoKg: number;
  observaciones?: string | null;
  estadoRegistroCode: string;
  encargadoUsuarioId?: number | null;
  createdAt: string;
}

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
  vacunoId: number;
  tipoPesoCode: string;
  pesoKg: number;
  observaciones?: string | null;
  estadoRegistroCode: string;
  encargadoUsuarioId?: number | null;
}

export interface TriajeHistorialItem {
  id: number;
  fechaHora: string;
  pesoKg: number;
  tipoPesoCode: string;
  observaciones?: string;
}