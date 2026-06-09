import { RegistroDiario } from '../models/registro-diario.model';

export abstract class ReporteLecheRepository {
  abstract getRegistroDiario(): Promise<RegistroDiario[]>;
  abstract getPDF(): Promise<void>;
}
