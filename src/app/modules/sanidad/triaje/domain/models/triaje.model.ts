export interface Triaje {
  id: number;
  codigo: string;
  fechaHora: string;
  vacunoId: number;
  vacunoNombre?: string;
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
  fechaHora: string;
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
export interface EliminarTriajePayload {
  motivoEliminacion: string;
}
export interface PagedResponse<T> {
  data: T[];
  totalRegistros: number;
  pagina: number;
  tamano: number;
  totalPaginas: number;
}