import { RegistroDiario } from './registro-diario.model';

export interface ReporteLeche {
  id: number;
  fecha: Date;
  registros: RegistroDiario[];
}
