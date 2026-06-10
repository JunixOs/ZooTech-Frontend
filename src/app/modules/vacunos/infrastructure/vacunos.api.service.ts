import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '@core/api/api.config';
import { PaginatedResult } from '@shared/models/pagination.model';
import { RegistrarVacunoRequest, RegistrarVacunoResponse, Vacuno } from '../domain/models/vacuno.model';

export interface VacunosQueryParams {
  page?: number;
  limit?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'activo' | 'eliminado';
  q?: string;
}

export interface VacunoActivityPointDto {
  fecha: string;
  cantidad: number;
}

export interface VacunoActivityStatsDto {
  fechaInicio: string;
  fechaFin: string;
  points: VacunoActivityPointDto[];
  mayor: number;
  menor: number;
}

export interface VacunoGenealogiaDto {
  id: number;
  codigo: string;
  nombre: string;
  raza: string;
  procedencia: string;
  sexo: string;
  nivel: number;
  padre: VacunoGenealogiaDto | null;
  madre: VacunoGenealogiaDto | null;
}

export interface UbigeoOption {
  codigo: string;
  nombre: string;
  hijos: UbigeoOption[];
}

export interface VacunoOptionsResponse {
  adquisicionOptions: string[];
  razaOptions: string[];
  sexoOptions: string[];
  aptoParaOptions: string[];
  ubigeoOptions?: UbigeoOption[];
}

interface VacunosApiResponse {
  items: Vacuno[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class VacunosApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listarVacunos(params: VacunosQueryParams = {}): Observable<PaginatedResult<Vacuno>> {
    let httpParams = new HttpParams()
      .set('page', params.page ?? 1)
      .set('pageSize', params.limit ?? 10);

    if (params.q?.trim()) {
      httpParams = httpParams.set('search', params.q.trim());
    }

    if (params.fechaDesde) {
      httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    }

    if (params.fechaHasta) {
      httpParams = httpParams.set('fechaHasta', params.fechaHasta);
    }

    if (params.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }

    return this.http
      .get<VacunosApiResponse>(`${this.apiBaseUrl}/vacunos`, { params: httpParams })
      .pipe(
        map((response) => ({
          items: response.items.map((vacuno) => ({
            ...vacuno,
            procedencia:
              vacuno.procedencia ??
              [vacuno.granja, vacuno.distrito, vacuno.provincia, vacuno.departamento]
                .filter(Boolean)
                .join(', '),
          })),
          totalItems: response.totalItems,
          paginaActual: response.page,
          totalPaginas: response.totalPages,
          limitePorPagina: response.pageSize,
        })),
      );
  }

  getActivityStats(fechaInicio: string, fechaFin: string): Observable<VacunoActivityStatsDto> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<VacunoActivityStatsDto>(
      `${this.apiBaseUrl}/vacunos/estadisticas/actividad`,
      { params },
    );
  }

  getGenealogia(codigoOId: string | number, niveles: number): Observable<VacunoGenealogiaDto> {
    const params = new HttpParams().set('niveles', Math.max(1, Math.min(4, niveles)));

    return this.http.get<VacunoGenealogiaDto>(
      `${this.apiBaseUrl}/vacunos/${encodeURIComponent(String(codigoOId))}/genealogia`,
      { params },
    );
  }

  obtenerOpciones(): Observable<VacunoOptionsResponse> {
    return this.http.get<VacunoOptionsResponse>(`${this.apiBaseUrl}/vacunos/options`);
  }

  registrarVacuno(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse> {
    const formData = new FormData();

    formData.append('codigo', data.codigo);
    formData.append('nombre', data.nombre);
    formData.append('fechaNacimiento', data.fechaNacimiento);
    formData.append('adquisicionPor', data.adquisicionPor);
    formData.append('raza', data.raza);
    formData.append('color', data.color);
    formData.append('sexo', data.sexo);
    formData.append('codigoPadre', data.codigoPadre);
    formData.append('codigoMadre', data.codigoMadre);
    formData.append('granja', data.granja);
    formData.append('distrito', data.distrito);
    this.appendIfPresent(formData, 'codigoDistrito', data.codigoDistrito);
    formData.append('departamento', data.departamento);
    this.appendIfPresent(formData, 'codigoDepartamento', data.codigoDepartamento);
    formData.append('provincia', data.provincia);
    this.appendIfPresent(formData, 'codigoProvincia', data.codigoProvincia);
    formData.append('aptoPara', data.aptoPara);
    formData.append('fechaEspecificacion', data.fechaEspecificacion);

    if (data.precioCompra != null) {
      formData.append('precioCompra', String(data.precioCompra));
    }

    if (data.observaciones?.trim()) {
      formData.append('observaciones', data.observaciones.trim());
    }

    if (data.foto instanceof File) {
      formData.append('foto', data.foto, data.foto.name);
    }

    return this.http.post<RegistrarVacunoResponse>(`${this.apiBaseUrl}/vacunos`, formData);
  }

  obtenerVacuno(codigo: string): Observable<Vacuno> {
    return this.http.get<Vacuno>(`${this.apiBaseUrl}/vacunos/${codigo}`);
  }

  actualizarVacuno(codigo: string, data: RegistrarVacunoRequest): Observable<Vacuno> {
    return this.http.put<Vacuno>(`${this.apiBaseUrl}/vacunos/${codigo}`, {
      nombre: data.nombre,
      fechaNacimiento: data.fechaNacimiento,
      adquisicionPor: data.adquisicionPor,
      raza: data.raza,
      color: data.color,
      sexo: data.sexo,
      codigoPadre: data.codigoPadre,
      codigoMadre: data.codigoMadre,
      granja: data.granja,
      distrito: data.distrito,
      codigoDistrito: data.codigoDistrito,
      departamento: data.departamento,
      codigoDepartamento: data.codigoDepartamento,
      provincia: data.provincia,
      codigoProvincia: data.codigoProvincia,
      aptoPara: data.aptoPara,
      fechaRegistroFuncion: data.fechaEspecificacion,
      observaciones: data.observaciones?.trim() ?? '',
      fotoUrl: '',
      estado: 'activo',
    });
  }

  eliminarVacuno(codigo: string, motivoEliminacion: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/vacunos/${codigo}`, {
      body: { motivoEliminacion },
    });
  }

  private appendIfPresent(formData: FormData, key: string, value: string | undefined): void {
    if (value?.trim()) {
      formData.append(key, value.trim());
    }
  }
}
