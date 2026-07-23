export type ReporteFormato = 'json' | 'excel' | 'pdf';
export type EstadoVacuno = 'vivo' | 'muerto' | string;

export interface ReporteVacunoListadoFiltros {
  FechaInicio?: string;
  FechaFin?: string;
  Keyword?: string;
  RazaCode?: string;
  ColorCode?: string;
  SexoCode?: string;
  TipoAdquisicionCode?: string;
  GranjaId?: string | number;
  EstadoCode?: EstadoVacuno | '';
  // Compatibilidad con pantallas existentes que aun llaman a la facade con nombres anteriores.
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
  q?: string;
  raza?: string;
  color?: string;
  sexo?: string;
  tipoAdquisicion?: string;
  granja?: string | number;
  estado?: EstadoVacuno | '';
  codigo?: string;
  fechaRegistro?: string;
  nombre?: string;
  procedencia?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  formato?: ReporteFormato;
}

export interface VacunoListadoItem {
  id?: number;
  codigo: string;
  nombre: string;
  fechaNacimiento?: string | null;
  tipoAdquisicion?: string | null;
  raza?: string | null;
  color?: string | null;
  sexo?: string | null;
  granja?: string | null;
  estado: EstadoVacuno;
  fechaRegistro: string;
  /** @deprecated Solo compatibilidad con vistas antiguas fuera del reporte listado. */
  procedencia?: string | null;
}

export interface ReporteVacunoListadoResponse {
  data: VacunoListadoItem[];
  resumen: {
    totalVacunos: number;
  };
  filtros: {
    FechaInicio?: string | null;
    FechaFin?: string | null;
    Keyword?: string | null;
    RazaCode?: string | null;
    ColorCode?: string | null;
    SexoCode?: string | null;
    TipoAdquisicionCode?: string | null;
    GranjaId?: string | number | null;
    EstadoCode?: string | null;
  };
  downloadUrl: string | null;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  limit?: number;
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
  tituloKey: string;
  descripcionKey: string;
  icono: string;
  route: string;
  disponible: boolean;
}
