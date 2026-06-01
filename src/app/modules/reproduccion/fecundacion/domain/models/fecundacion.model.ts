export interface FecundacionRegistro {
  codigoRegistro: string;
  fecha: string;
  codigoVacuno: string;
  nombreVacuno: string;
  tipoFecundacion: 'IA' | 'MN' | 'TE';
  estado: 'pendiente' | 'exitosa' | 'fallida';
}
