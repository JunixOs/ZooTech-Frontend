export type VacunoEstado = 'Activo' | 'Inactivo' | 'Vendido';

export interface Vacuno {
  codigo: string;
  nombre: string;
  raza: string;
  fechaNacimiento: string;
  sexo: 'Macho' | 'Hembra';
  estado: VacunoEstado;
  adquisicionPor: string;
  color: string;
  codigoPadre: string;
  codigoMadre: string;
  aptoPara: string;
  fechaRegistroEspecializacion: string;
  granja: string;
  departamento: string;
  provincia: string;
  distrito: string;
  observaciones: string;
  fotoUrl: string;
}

export interface VacunoRegistro {
  codigo: string;
  nombre: string;
  raza: string;
  fechaNacimiento: string;
  sexo: 'M' | 'H';
  estado: 'activo' | 'inactivo' | 'vendido';
}
