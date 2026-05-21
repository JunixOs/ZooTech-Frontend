// ==========================================
// src/app/modules/reproduccion/domain/celo.model.ts
// ==========================================

export interface Celo {
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string;
  vecesEnCelo: number;
}

export interface EditarCeloRequest {
  id: number;
  observaciones: string;
  caracteristicaCodes: string[];
}

export interface CrearCeloRequest {
  vacunoId: number;
  fechaHora: string;
  encargadoUsuarioId: number;
  observaciones?: string;
  caracteristicaCodes?: string[];
}
