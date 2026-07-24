import { ApiResponse } from '@shared/models/api-response.model';

export interface VacunoItemDto {
  id: number;
  codigo: string;
  fechaRegistro: string;
  nombre: string;
  raza: string;
  sexo: string;
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

export interface VacunoListItemResponseDto {
  id: number;
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  razaCode: string;
  procedencia?: string | null;
  estado: string;
  fechaRegistro?: string;
  createdAt?: string;
}

export type VacunoListApiResponseDto = ApiResponse<VacunoListItemResponseDto[]> & {
  page?: number;
  pageSize?: number;
  limit?: number;
  totalCount?: number;
  pagination?: Partial<VacunoPaginationDto> & { pageSize?: number };
};
