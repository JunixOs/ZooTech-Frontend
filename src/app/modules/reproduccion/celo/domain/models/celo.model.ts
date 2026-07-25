/**
 * Representa un registro de celo de una vaca.
 */
export interface CeloRegistro {
  id?: number;
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string;
  vecesEnCelo: number;
  observaciones?: string | null;
  caracteristicaCodes?: string[];
}

/**
 * Payload requerido por el backend para registrar un nuevo celo.
 */
export interface RegistrarCeloRequest {
  vacunoId: number;
  encargadoUsuarioId: number;
  fechaHora: string;
  observaciones: string;
  caracteristicaCodes: string[];
}

export interface VacaCelo {
  id: number;
  codigo: string;
  nombre: string;
  diasRestante: number;
  estado: 'En celo' | 'Próximo' | 'Pasó';
  vecesEnCelo: number;
  crias: number;
}

export interface EditarCeloPayload {
  id: number;
  observaciones: string;
  caracteristicaCodes: string[];
  fechaHora?: string;
}

export interface EliminarCeloPayload {
  id: number;
  motivoEliminacion: string;
}

/**
 * Información para el reporte Comparación de Celos Real vs Estándar.
 */
export interface ComparacionRealVsEstandar {
  fecha: string;
  registrosReales: number;
  registrosEstandar: number;
}
