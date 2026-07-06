export interface ReporteCeloPorVacuno {
  codigoVacuno: string;
  nombre: string;
  ultimoCelo: string;
  vecesEnCelo: number;
}

export interface ComparacionCelosPorVacuno {
  periodo: string;
  registrosReales: number;
  registrosEstandar: number;
}

export interface DetalleCeloPorVacuno {
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string;
  vecesEnCelo: number;
  caracteristicas: number;
  listaCaracteristicas: string[];
  observaciones: string;
  crias: number;
}
