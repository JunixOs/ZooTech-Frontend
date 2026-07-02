export type VacunoEstado =
  | 'Vivo'
  | 'Muerto'
  | 'activo'
  | 'eliminado'
  | 'inactivo'
  | 'vendido'
  | 'vivo'
  | 'muerto';
export type EstadoVacuno = VacunoEstado;

export interface Vacuno {
  id?: number;
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  adquisicionPor?: string;
  raza: string;
  color?: string;
  sexo: string;
  codigoPadre?: string;
  codigoMadre?: string;
  granjaId?: number;
  granja?: string;
  distrito: string;
  codigoDistrito?: string;
  departamento?: string;
  codigoDepartamento?: string;
  provincia?: string;
  codigoProvincia?: string;
  procedencia?: string;
  aptoPara?: string;
  fechaRegistro?: Date;
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
