export interface LecheRegistro {
  codigoRegistro: string;
  fecha: string;
  codigoVacuno: string;
  nombreVacuno: string;
  litros: number;
  turno: 'manana' | 'tarde';
}
