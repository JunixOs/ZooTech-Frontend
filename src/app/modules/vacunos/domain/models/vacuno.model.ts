export type VacunoEstado =
  | 'Vivo'
  | 'Muerto'
  | 'activo'
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
  sexo: string;
  color?: string;
  procedencia?: string;
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
export type SexoVacuno = 'MACHO' | 'HEMBRA';
export type AptoPara = 'LECHE' | 'CARNE' | 'REPRODUCCION';

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

export interface VacunosQueryParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
  q?: string;
  query?: string;
  estado?: string;
}

export interface GranjaOption {
  id: number;
  nombre: string;
  codigoDistrito: string;
  distrito: string | null;
  provincia: string | null;
  departamento: string | null;
}

export interface VacunoReferenceOption {
  id: number;
  codigo: string;
  nombre: string;
  sexoCode: string;
  estadoCode?: string | null;
}

export interface VacunoActivityPointDto {
  fecha: string;
  cantidad: number;
}

export interface VacunoActivityStatsDto {
  fechaInicio: string;
  fechaFin: string;
  points: VacunoActivityPointDto[];
  mayor: number;
  menor: number;
}

export interface VacunoGenealogiaDto {
  id: number;
  codigo: string;
  nombre: string;
  raza: string;
  procedencia: string;
  sexo: string;
  nivel: number;
  padre: VacunoGenealogiaDto | null;
  madre: VacunoGenealogiaDto | null;
}
