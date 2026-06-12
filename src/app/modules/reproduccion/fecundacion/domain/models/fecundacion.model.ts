export interface FecundacionRegistro {
  id: number;
  codigo: string;
  tipoFecundacionCode: string;
  vacunoReceptorId: number;
  resultadoCode: string;
  fechaProcedimiento: string;
}

export interface RegistrarFecundacionRequest {
  tipoFecundacionCode: string;
  vacunoReceptorId: number;
  vacunoDonanteId?: number | null;
  nombreMachoExterno?: string | null;
  fechaProcedimiento: string;
  responsableId: number;
  codigoSemen?: string | null;
  codigoEmbrion?: string | null;
  observaciones?: string | null;
}
