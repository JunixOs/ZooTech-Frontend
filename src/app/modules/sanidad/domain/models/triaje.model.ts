export interface Triaje {
  id: string;
  codigo: string;
  fecha_hora: string;
  vacuno_id: string;
  tipo_peso_code: string;
  peso_kg: number;
  observaciones?: string | null;
  estado_registro_code: string;
  encargado_usuario_id?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  motivo_eliminacion?: string | null;
}
export interface TriajeVacunoOption {
  id: string;
  codigo: string;
  nombre: string;
}

export interface TriajeTipoPesoOption {
  code: string;
  nombre: string;
}

export interface RegistrarTriajePayload {
  fecha_hora: string;
  vacuno_id: string;
  tipo_peso_code: string;
  peso_kg: number;
  observaciones?: string | null;
  encargado_usuario_id?: string | null;
}

export interface TriajeHistorialItem {
  id: string;
  fecha_hora: string;
  peso_kg: number;
  tipo_peso_code: string;
  observaciones?: string;
}
