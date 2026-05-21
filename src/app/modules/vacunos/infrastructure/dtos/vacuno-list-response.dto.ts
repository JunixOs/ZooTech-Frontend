export interface VacunoItemDto {
  id: number;
  codigo: string;
  fechaRegistro: string;
  nombre: string;
  raza: string;
  procedencia: string;
  estado: 'vivo' | 'muerto';
}

export interface VacunoPaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VacunoListResponseDto {
  data: VacunoItemDto[];
  pagination: VacunoPaginationDto;
}
