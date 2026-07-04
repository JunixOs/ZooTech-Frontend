export type VacunoEstado = 'vivo' | 'muerto' | 'activo' | 'eliminado' | 'inactivo' | 'vendido';
export type EstadoVacuno = VacunoEstado; // Alias para compatibilidad

export interface Vacuno {
  id?: number;
  codigo: string;
  nombre: string;
  fechaRegistro?: Date;
  fechaNacimiento?: string;
  raza: string;
  sexo: string;
  color?: string;
  procedencia?: string;
  adquisicionPor?: string;
  codigoPadre?: string;
  codigoMadre?: string;
  granja?: string;
  distrito?: string;
  codigoDistrito?: string;
  departamento?: string;
  codigoDepartamento?: string;
  provincia?: string;
  codigoProvincia?: string;
  aptoPara?: string;
  fechaRegistroEspecializacion?: string;
  fechaRegistroFuncion?: string;
  observaciones?: string;
  fotoUrl?: string;
  estado: VacunoEstado;
}

export interface VacunoRegistro extends Vacuno {}
