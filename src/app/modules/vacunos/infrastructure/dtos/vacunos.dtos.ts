import { VacunoEstado } from '../../domain/models/vacuno.model';

export type AdquisicionPor = 'monta' | 'compra';
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
  granja: string;
  distrito: string;
  codigoDistrito?: string;
  departamento: string;
  codigoDepartamento?: string;
  provincia: string;
  codigoProvincia?: string;
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
  limit?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  query?: string;
  estado?: string;
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

export interface UbigeoOption {
  codigo: string;
  nombre: string;
  hijos: UbigeoOption[];
}

export interface VacunoOptionsResponse {
  adquisicionOptions: string[];
  razaOptions: string[];
  sexoOptions: string[];
  aptoParaOptions: string[];
  ubigeoOptions?: UbigeoOption[];
}
