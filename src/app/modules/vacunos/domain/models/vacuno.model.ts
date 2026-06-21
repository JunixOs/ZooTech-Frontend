export type VacunoEstado = 'vivo' | 'muerto' | 'activo' | 'eliminado' | 'inactivo' | 'vendido';
export type EstadoVacuno = VacunoEstado; // Alias para compatibilidad

export interface Vacuno {
  id?: number;
  codigo: string;
  nombre: string;
  fechaRegistro?: Date;
  fechaNacimiento?: string;
  raza: string;
  color?: string;
  sexo?: string;
  procedencia?: string;
  adquisicionPor?: string;
  codigoPadre?: string;
  codigoMadre?: string;
  granjaId?: number;
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

export interface VacunoRegistro extends Vacuno { }

export type AdquisicionPor = 'COMPRA' | 'DONACION' | 'NACIMIENTO';
export type SexoVacuno = 'macho' | 'hembra';
export type AptoPara = 'produccion_leche' | 'carne' | 'reproduccion';

export interface RegistrarVacunoRequest {
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  adquisicionPor: AdquisicionPor;
  precioCompra?: number | null;
  raza: string;
  color: string;
  sexo: SexoVacuno;
  codigoPadre: string;
  codigoMadre: string;
  granjaId: number;
  aptoPara: AptoPara;
  fechaEspecificacion: string;
  observaciones?: string;
  foto?: File | null;
}

export interface RegistrarVacunoResponse {
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  adquisicionPor: AdquisicionPor;
  precioCompra?: number | null;
  fotoUrl?: string | null;
  creadoEn: string;
}
