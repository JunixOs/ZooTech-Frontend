export interface TriajeVacunoOption {
  id: string;
  codigo: string;
  nombre?: string;
}

export interface TriajeTipoPesoOption {
  id: string;
  nombre: string;
}

export interface RegistrarTriajePayload {
  fecha: string;
  vacunoId: string;
  pesoKg: number | null;
  tipoPesoId: string;
  observaciones: string;
}

export interface TriajeHistorialItem {
  id: string;
  fecha: string;
  pesoKg: number | null;
  tipoPeso: string;
  observaciones?: string;
}
