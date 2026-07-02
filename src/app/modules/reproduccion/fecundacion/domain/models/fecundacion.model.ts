export interface FecundacionRegistro {
  codigoRegistro: string;
  fecha: string;
  codigoVacuno: string;
  nombreVacuno: string;
  tipoFecundacion: 'IA' | 'MN' | 'TE';
  estado: 'pendiente' | 'exitosa' | 'fallida';
}

export interface FecundacionOption {
  code: string;
  nombre: string;
  descripcion?: string | null;
}

export interface FecundacionOptions {
  tipos: FecundacionOption[];
  resultados: FecundacionOption[];
  estados: FecundacionOption[];
}

export interface FecundacionVacunoOption {
  id: number;
  codigo: string;
  nombre: string;
  sexo: string;
}

export interface FecundacionVacunoResumen {
  id: number;
  codigo: string;
  nombre: string;
}

export interface FecundacionEdit {
  id: number;
  codigo: string;
  tipoFecundacion: string;
  vacunoReceptor: FecundacionVacunoResumen;
  machoODonante: FecundacionVacunoResumen | string;
  machoExterno: boolean;
  fechaProcedimiento: string;
  responsable: string;
  resultado: string;
  codigoSemen?: string | null;
  codigoEmbrion?: string | null;
  observaciones?: string | null;
  estadoFecundacion: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface UpdateFecundacionRequest {
  tipoFecundacion: string;
  vacunoReceptorId: number;
  machoODonante: number | string;
  machoExterno: boolean;
  fechaProcedimiento: string;
  responsable: string;
  resultado: string;
  codigoSemen?: string | null;
  codigoEmbrion?: string | null;
  observaciones?: string | null;
}

export interface FecundacionUpdateResponse {
  id: number;
  tipoFecundacion: string;
  vacunoReceptor: FecundacionVacunoResumen;
  machoODonante: FecundacionVacunoResumen | string;
  fechaProcedimiento: string;
  responsable: string;
  resultado: string;
  codigoSemen?: string | null;
  codigoEmbrion?: string | null;
  observaciones?: string | null;
  actualizadoEn: string;
  warning?: string | null;
}
