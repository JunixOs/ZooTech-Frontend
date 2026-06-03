export type VacunoEstado =
  | 'activo'
  | 'inactivo'
  | 'vendido'
  | 'Muerto'
  | 'Vivo'
  | 'muerto'
  | 'vivo';

export interface Vacuno {
  id?: number;
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  adquisicionPor: string;
  precioCompra?: number | null;
  raza: string;
  color: string;
  sexo: string;
  codigoPadre: string;
  codigoMadre: string;
  granja: string;
  distrito: string;
  codigoDistrito?: string;
  departamento: string;
  codigoDepartamento?: string;
  provincia: string;
  codigoProvincia?: string;
  aptoPara: string;
  fechaEspecificacion?: string;
  fechaRegistroEspecializacion?: string;
  fechaRegistroFuncion?: string;
  observaciones: string;
  fotoUrl: string | null;
  estado: VacunoEstado;
}

export interface VacunoRegistro extends Vacuno {}
