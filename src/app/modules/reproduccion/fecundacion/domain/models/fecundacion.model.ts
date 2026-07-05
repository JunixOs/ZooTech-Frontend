export interface FecundacionRegistro {
  id: number;
  codigoFecundacion: string;
  fechaProcedimiento: string;
  nombreVacunoReceptor: string;
  responsable: string | null;
  tipoFecundacion: 'INSEMINACION_ARTIFICIAL' | 'MONTA_NATURAL' | 'TRANSFERENCIA_EMBRION';
  codigoResultado: 'EXITOSO' | 'PENDIENTE' | 'FALLIDO';
  nombreDonante: string;
}
