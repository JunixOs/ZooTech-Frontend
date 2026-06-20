export type VacunoEstado = 'activo' | 'eliminado' | 'vivo' | 'muerto';
export type EstadoVacuno = VacunoEstado;

export interface Vacuno {
  id: number;
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  tipoAdquisicionCode: string;
  razaCode: string;
  colorCode: string;
  sexoCode: string;
  padreId: number | null;
  madreId: number | null;
  granjaId: number;
  observaciones?: string;
  fechaRegistro?: string | Date;
  createdAt?: string;
  updatedAt?: string;
  procedencia?: string;
  estado: VacunoEstado;

  // Alias de lectura usados por las tablas y reportes compartidos.
  adquisicionPor?: string;
  raza: string;
  color?: string;
  sexo: string;
  codigoPadre?: string;
  codigoMadre?: string;
  granja?: string;
  distrito: string;
  departamento?: string;
  provincia?: string;
  aptoPara?: string;
  fechaRegistroFuncion?: string;
  fechaRegistroEspecializacion?: string;
  fotoUrl?: string;
}

export type VacunoRegistro = Vacuno;

export interface RegistrarVacunoRequest {
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  tipoAdquisicionCode: string;
  razaCode: string;
  colorCode: string;
  sexoCode: string;
  padreId: number | null;
  madreId: number | null;
  granjaId: number;
  observaciones?: string;
}

export type EditarVacunoRequest = Omit<RegistrarVacunoRequest, 'codigo'>;
export type RegistrarVacunoResponse = Vacuno;

export interface VacunoCatalogOption {
  code: string;
  nombre: string;
}

export interface GranjaCatalogOption {
  id: number;
  nombre: string;
}

export interface VacunoCatalogs {
  tiposAdquisicion: VacunoCatalogOption[];
  razas: VacunoCatalogOption[];
  colores: VacunoCatalogOption[];
  sexos: VacunoCatalogOption[];
  granjas: GranjaCatalogOption[];
}

export type AdquisicionPor = string;
export type SexoVacuno = string;
export type AptoPara = string;
