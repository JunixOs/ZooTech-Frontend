export interface VacunoRegistro {
  codigo: string;
  nombre: string;
  raza: string;
  fechaNacimiento: string;
  sexo: 'M' | 'H';
  estado: 'activo' | 'inactivo' | 'vendido';
}
