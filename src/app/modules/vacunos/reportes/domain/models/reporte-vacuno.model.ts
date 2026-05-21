export type ReporteFormato = 'json' | 'excel' | 'pdf';
export type EstadoVacuno = 'vivo' | 'muerto' | string;

export interface ReporteVacunoListadoFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  q?: string;
  raza?: string;
  procedencia?: string;
  estado?: EstadoVacuno | '';
  aptoPara?: string;
  formato?: ReporteFormato;
  page?: number;
  limit?: number;
}

export interface VacunoListadoItem {
  id: number;
  codigo: string;
  fechaRegistro: string;
  nombre: string;
  raza: string | null;
  procedencia: string | null;
  estado: EstadoVacuno;
}

export interface ReporteVacunoListadoResponse {
  data: VacunoListadoItem[];
  resumen: {
    totalVacunos: number;
  };
  filtros: {
    fechaDesde: string | null;
    fechaHasta: string | null;
    q?: string | null;
    formato: ReporteFormato;
  };
  downloadUrl: string | null;
}

export interface VacunoRegistroDetalle {
  id: number;
  codigo: string;
  nombre: string;
  fechaNacimiento: string | null;
  adquisicionPor: string | null;
  precioCompra: number | null;
  raza: string | null;
  color: string | null;
  sexo: string | null;
  codigoPadre: string | null;
  codigoMadre: string | null;
  codigoAbuelo?: string | null;
  codigoAbuela?: string | null;
  granja?: string | null;
  distrito?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  procedencia?: string | null;
  aptoPara: string | null;
  fechaEspecificacion?: string | null;
  observaciones: string | null;
  fotoUrl: string | null;
  estado: EstadoVacuno;
  fechaRegistro?: string | null;
  creadoEn: string | null;
  actualizadoEn: string | null;
}

export interface RegistroVacunoReporteResponse {
  vacuno: VacunoRegistroDetalle;
  historial: unknown[];
  downloadUrl: string | null;
}

export interface ReporteVacunoCard {
  titulo: string;
  descripcion: string;
  icono: string;
  route: string;
  disponible: boolean;
}
