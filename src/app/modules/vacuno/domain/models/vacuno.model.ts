// ─────────────────────────────────────────────────────────────────────────────
// Tipos exactos según el API Contract del módulo Vacuno v1.0.0
// Endpoint base: /v1/vacunos
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums del contrato ────────────────────────────────────────────────────────
export type AdquisicionPor = 'monta' | 'compra';
export type SexoVacuno = 'macho' | 'hembra';
export type EstadoVacuno = 'vivo' | 'muerto';
export type AptoPara = 'produccion_leche' | 'carne' | 'reproduccion';

// ── GET /v1/vacunos ──────────────────────────────────────────────────────────
export interface VacunoListItem {
  id: number;
  codigo: string;
  fechaRegistro: string;
  nombre: string;
  raza: string;
  procedencia: string;
  estado: EstadoVacuno;
}

export interface VacunoListResponse {
  data: VacunoListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VacunoFiltros {
  page?: number;
  limit?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  q?: string;
  raza?: string;
  procedencia?: string;
  estado?: EstadoVacuno | '';
}

// ── GET /v1/vacunos/:id ───────────────────────────────────────────────────────
export interface VacunoDetalle {
  id: number;
  codigo: string;
  nombre: string;
  fechaNacimiento: string;  // YYYY-MM-DD
  adquisicionPor: AdquisicionPor;
  precioCompra: number | null;
  raza: string;
  color: string;
  sexo: SexoVacuno;
  codigoPadre: string;
  codigoMadre: string;
  granja: string;
  distrito: string;
  departamento: string;
  provincia: string;
  aptoPara: AptoPara;
  fechaEspecificacion: string;  // YYYY-MM-DD
  observaciones: string | null;
  fotoUrl: string | null;
  estado: EstadoVacuno;
  creadoEn: string;  // ISO 8601
  actualizadoEn: string;  // ISO 8601
}

// ── POST /v1/vacunos ─────────────────────────────────────────────────────────
// Los campos coinciden EXACTAMENTE con los nombres del API Contract (multipart/form-data)
export interface RegistrarVacunoRequest {
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  adquisicionPor: AdquisicionPor;
  precioCompra?: number | null;
  raza: string;
  color: string;
  sexo: SexoVacuno;
  codigoPadre: string;
  codigoMadre: string;
  granja: string;
  distrito: string;
  departamento: string;
  provincia: string;
  aptoPara: AptoPara;
  fechaEspecificacion: string;
  observaciones?: string;
  foto?: File | null;
}

export interface RegistrarVacunoResponse {
  id: number;
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  adquisicionPor: AdquisicionPor;
  precioCompra: number | null;
  fotoUrl: string | null;
  creadoEn: string;
}

// ── PATCH /v1/vacunos/:id ─────────────────────────────────────────────────────
export interface EditarVacunoRequest {
  nombre?: string;
  precioCompra?: number | null;
  raza?: string;
  color?: string;
  sexo?: SexoVacuno;
  granja?: string;
  distrito?: string;
  departamento?: string;
  provincia?: string;
  aptoPara?: AptoPara;
  fechaEspecificacion?: string;
  foto?: File | null;
  observaciones?: string;
}

// ── Error estándar del API ────────────────────────────────────────────────────
export interface ApiError {
  error: {
    code: string;
    message: string;
    details: { field: string; message: string }[];
  };
}
