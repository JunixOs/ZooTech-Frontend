export interface FecundacionRegistro {
  codigoRegistro: string;
  fecha: string;
  codigoVacuno: string;
  nombreVacuno: string;
  tipoFecundacion: 'IA' | 'MN' | 'TE';
  estado: 'pendiente' | 'exitosa' | 'fallida';
}

export type EstadoFecundacion =
  | 'pendiente'
  | 'en_proceso'
  | 'confirmada'
  | 'en_gestacion'
  | 'fallida'
  | 'sin_estado';

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
  codigoVacuno: string;
  nombreVacuno: string;
  raza: string;
  estadoReproductivoActual: EstadoFecundacion;
  disponibleNuevaFecundacion: boolean;
  ultimaActualizacion: string;
  ultimoRegistroActivo: UltimoRegistroFecundacion | null;
}
