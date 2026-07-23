export interface FecundacionRegistro {
  id: number;
  codigoFecundacion: string;
  fechaProcedimiento: string;
  nombreVacunoReceptor: string;
  responsable: string | null;
  tipoFecundacion: string;
  codigoResultado: string;
  nombreDonante: string | null;
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

export interface CreateFecundacionRequest {
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

export interface CreateFecundacionResponse {
  id: number;
  codigo: string;
  fechaProcedimiento: string;
}

export interface UpdateFecundacionRequest extends CreateFecundacionRequest {
  estadoFecundacion?: string | null;
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

export interface UltimoRegistroFecundacion {
  codigoRegistro: string;
  activo: boolean;
  tipoFecundacion: string;
  vacunoReceptor: string;
  toroDonante: string;
  fechaProcedimiento: string;
  responsable: string;
  resultadoRegistrado: string;
  observacionesVeterinarias: string;
}

export interface EstadoFecundacionVacuno {
  vacunoId?: number | string;
  fecundacionId?: number | string | null;
  codigoVacuno: string;
  nombreVacuno: string;
  raza: string;
  estadoReproductivoActual: string;
  disponibleNuevaFecundacion: boolean;
  ultimaActualizacion: string;
  ultimoRegistroActivo: UltimoRegistroFecundacion | null;
}

export interface VacunoHembraFecundacionOption {
  id: number | string;
  codigoVacuno: string;
  nombreVacuno: string;
  raza: string;
}

export type EstadoFecundacion =
  | 'pendiente'
  | 'en_proceso'
  | 'confirmada'
  | 'en_gestacion'
  | 'fallida'
  | 'sin_estado';

export const ESTADOS_FECUNDACION_PERMITIDOS: readonly EstadoFecundacion[] = [
  'pendiente',
  'en_proceso',
  'confirmada',
  'en_gestacion',
  'fallida',
  'sin_estado',
];

export type TipoFecundacion = 'IA' | 'MN' | 'TE';

export interface UltimoRegistroFecundacion {
  codigoRegistro: string;
  activo: boolean;
  tipoFecundacion: TipoFecundacion;
  vacunoReceptor: string;
  toroDonante: string;
  fechaProcedimiento: string;
  responsable: string;
  resultadoRegistrado: string;
  observacionesVeterinarias: string;
}

export interface EstadoFecundacionVacuno {
  vacunoId?: number | string;
  fecundacionId?: number | string | null;
  codigoVacuno: string;
  nombreVacuno: string;
  raza: string;
  estadoReproductivoActual: EstadoFecundacion;
  disponibleNuevaFecundacion: boolean;
  ultimaActualizacion: string;
  ultimoRegistroActivo: UltimoRegistroFecundacion | null;
}

export interface VacunoHembraFecundacionOption {
  id: number | string;
  codigoVacuno: string;
  nombreVacuno: string;
  raza: string;
}
