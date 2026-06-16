export interface ResumenSanidad {
  totalTriajes: number;
  pesoPromedioKg: number;
  pesoMinimoKg: number;
  pesoMaximoKg: number;
  totalVacunosEvaluados: number;
  distribucionTipoPeso: TipoPesoCountItem[];
}

export interface TipoPesoCountItem {
  code: string;
  nombre: string;
  cantidad: number;
}

export interface PesoPromedioItem {
  fecha: string;
  pesoPromedio: number;
  cantidadRegistros: number;
}
