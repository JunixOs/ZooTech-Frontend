export interface TenenciaRegistro {
  codigoRegistro: string;
  codigoVacuno: string;
  nombreVacuno: string;
  fechaInicio: string;
  fechaFin: string | null;
  tipo: 'propia' | 'alquilada' | 'prestada';
  estado: 'activa' | 'finalizada';
}
