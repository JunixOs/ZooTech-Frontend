import { VacunoEstado } from '../../domain/models/vacuno.model';

export type AdquisicionPor = 'COMPRA' | 'DONACION' | 'NACIMIENTO';
export type SexoVacuno = 'MACHO' | 'HEMBRA' | 'macho' | 'hembra';
export type AptoPara = 'LECHE' | 'CARNE' | 'PRODUCCION_LECHE' | 'PRODUCCION_CARNE' | 'REPRODUCCION' | 'produccion_leche' | 'produccion_carne' | 'carne' | 'reproduccion';

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
  limit?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'activo' | 'eliminado';
  q?: string;
  query?: string;
}

export interface GranjaOption {
  id: number;
  nombre: string;
  codigoDistrito: string;
  distrito: string | null;
  provincia: string | null;
  departamento: string | null;
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

export interface VacunoCatalogOption {
  code: string;
  nombre: string;
}

export interface VacunoOptionsResponse {
  adquisicionOptions: VacunoCatalogOption[];
  razaOptions: VacunoCatalogOption[];
  colorOptions: VacunoCatalogOption[];
  sexoOptions: VacunoCatalogOption[];
  aptoParaOptions: VacunoCatalogOption[];
  ubigeoOptions?: UbigeoOption[];
}
