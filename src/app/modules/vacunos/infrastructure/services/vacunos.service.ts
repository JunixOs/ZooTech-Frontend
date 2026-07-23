import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import { API_BASE_URL } from '@core/api/api.config';
import { PaginatedResult } from '@shared/models/pagination.model';
import {
  GranjaOption,
  RegistrarVacunoRequest,
  RegistrarVacunoResponse,
  Vacuno,
  VacunoActivityStatsDto,
  VacunoGenealogiaDto,
  VacunoOptionsResponse,
  VacunoReferenceOption,
  VacunosQueryParams,
} from '../../domain/models/vacuno.model';
import { VacunoMapper } from '../../application/mappers/vacunos.mapper';
import { VacunoRepository } from '../../domain/interfaces/vacunos-repository.interface';

type ApiResponse<T> = { data: T; success: boolean; errorMessage: string | null };

interface BackendVacunoItem {
  id: number;
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  razaCode: string;
  sexoCode: string;
  procedencia?: string | null;
  estado: string;
  fechaRegistro?: string;
  createdAt?: string;
}

interface BackendVacunoDetail {
  id: number;
  codigo: string;
  nombre: string;
  fechaNacimiento: string;
  tipoAdquisicionCode: string;
  razaCode: string;
  colorCode: string;
  sexoCode: string;
  padreId: number | null;
  madreId: number | null;
  granjaId: number;
  observaciones: string | null;
  fechaRegistro: string;
  createdAt: string;
  updatedAt: string;
  codigoPadre?: string | null;
  codigoMadre?: string | null;
  granja?: string | null;
  distrito?: string | null;
  provincia?: string | null;
  departamento?: string | null;
  codigoDistrito?: string | null;
  aptoPara?: string | null;
  fechaUtilizacion?: string | null;
}

interface BackendListEnvelope {
  data?: BackendVacunoItem[];
  page?: number;
  pageSize?: number;
  limit?: number;
  totalCount?: number;
  pagination?: {
    page?: number;
    pageSize?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable({ providedIn: 'root' })
export class VacunoService implements VacunoRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private get baseUrl() { return `${this.apiBaseUrl}/vacunos`; }

  getAll(params: VacunosQueryParams = {}): Observable<PaginatedResult<Vacuno>> {
    let httpParams = new HttpParams();
    const search = params.search ?? params.q ?? params.query;
    const pageSize = params.pageSize ?? params.limit;

    if (search?.trim()) httpParams = httpParams.set('search', search.trim());
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (pageSize) httpParams = httpParams.set('pageSize', String(pageSize));

    return this.http.get<BackendListEnvelope | ApiResponse<BackendVacunoItem[]>>(this.baseUrl, { params: httpParams })
      .pipe(
        map((response) => {
          const envelope = response as BackendListEnvelope;
          const data = Array.isArray(response.data) ? response.data : [];
          const mappedItems = data.map((v) => VacunoMapper.fromBackendItem(v));

          const page = envelope.pagination?.page ?? envelope.page ?? params.page ?? 1;
          const limit = envelope.pagination?.pageSize ?? envelope.pageSize ?? envelope.pagination?.limit ?? envelope.limit ?? pageSize ?? 10;
          const totalItems = envelope.pagination?.total ?? envelope.totalCount ?? mappedItems.length;
          const totalPages = envelope.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / limit));

          return {
            items: mappedItems,
            totalItems,
            paginaActual: page,
            totalPaginas: totalPages,
            limitePorPagina: limit,
          };
        }),
      );
  }

  getById(id: string | number): Observable<Vacuno> {
    return this.http
      .get<ApiResponse<BackendVacunoDetail>>(`${this.baseUrl}/${id}`)
      .pipe(map((r) => this.toVacuno(r.data)));
  }

  create(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse> {
    const body = this.toSaveBody(data, true);
    return this.http
      .post<ApiResponse<RegistrarVacunoResponse>>(this.baseUrl, body)
      .pipe(map((r) => r.data));
  }

  updateById(id: string | number, data: RegistrarVacunoRequest): Observable<Vacuno> {
    const body = this.toSaveBody(data, false);
    return this.http
      .patch<ApiResponse<BackendVacunoDetail>>(`${this.baseUrl}/${id}`, body)
      .pipe(map((r) => this.toVacuno(r.data)));
  }

  deleteById(id: string | number, motivoEliminacion: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      body: { motivoEliminacion },
    });
  }

  getOptions(): Observable<VacunoOptionsResponse> {
    return of({
      adquisicionOptions: ['NACIMIENTO', 'COMPRA', 'DONACION'],
      razaOptions: ['Jersey', 'Holstein', 'Angus', 'Hereford', 'Simmental', 'Brown Swiss', 'Brahman', 'Charolais'],
      sexoOptions: ['HEMBRA', 'MACHO'],
      aptoParaOptions: ['LECHE', 'CARNE', 'REPRODUCCION'],
      ubigeoOptions: [],
    });
  }

  getGranjas(): Observable<GranjaOption[]> {
    return this.http.get<GranjaOption[]>(`${this.baseUrl}/granjas`);
  }

  getActivityStats(fechaInicio: string, fechaFin: string): Observable<VacunoActivityStatsDto> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<VacunoActivityStatsDto>(
      `${this.baseUrl}/estadisticas/actividad`,
      { params },
    );
  }

  getGenealogia(codigoOId: string | number, niveles: number): Observable<VacunoGenealogiaDto> {
    const params = new HttpParams().set('niveles', Math.max(1, Math.min(4, niveles)));

    return this.http.get<any>(
      `${this.baseUrl}/${encodeURIComponent(String(codigoOId))}/genealogia`,
      { params },
    ).pipe(
      map((response) => {
        const data = response.data ?? response;

        if (Array.isArray(data)) {
          const tree = VacunoMapper.buildGenealogyTree(data, codigoOId);
          if (!tree) {
            throw new Error('vacunos.reportes.feedback.genealogyTreeFailed');
          }
          return tree;
        }

        return data as VacunoGenealogiaDto;
      }),
    );
  }

  exportarArbolExcel(id: number, niveles: number = 4): Observable<Blob> {
    const params = new HttpParams().set('niveles', niveles);
    return this.http.get(`${this.baseUrl}/${id}/genealogia/exportar`, {
      params,
      responseType: 'blob',
    });
  }

  getCatalogos(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/catalogos`);
  }

  getReferences(): Observable<VacunoReferenceOption[]> {
    return this.http
      .get<ApiResponse<VacunoReferenceOption[]>>(`${this.baseUrl}/referencias`)
      .pipe(map((r) => r.data ?? []));
  }

  private toVacuno(data: BackendVacunoDetail): Vacuno {
    return {
      id: data.id,
      codigo: data.codigo,
      nombre: data.nombre,
      fechaNacimiento: data.fechaNacimiento,
      adquisicionPor: data.tipoAdquisicionCode,
      raza: data.razaCode,
      color: data.colorCode,
      sexo: data.sexoCode,
      codigoPadre: data.codigoPadre ?? undefined,
      codigoMadre: data.codigoMadre ?? undefined,
      granjaId: data.granjaId,
      granja: data.granja ?? undefined,
      distrito: data.distrito ?? '',
      provincia: data.provincia ?? '',
      departamento: data.departamento ?? '',
      observaciones: data.observaciones ?? undefined,
      fechaRegistro: data.fechaRegistro ? new Date(data.fechaRegistro) : undefined,
      aptoPara: data.aptoPara ?? undefined,
      fechaRegistroFuncion: data.fechaUtilizacion ?? undefined,
      estado: 'activo',
    };
  }

  private toSaveBody(data: RegistrarVacunoRequest, includeCodigo: boolean) {
    return {
      ...(includeCodigo ? { codigo: data.codigo } : {}),
      nombre: data.nombre,
      fechaNacimiento: data.fechaNacimiento,
      tipoAdquisicionCode: data.adquisicionPor,
      razaCode: data.raza,
      colorCode: data.color,
      sexoCode: data.sexo,
      codigoPadre: data.codigoPadre || null,
      codigoMadre: data.codigoMadre || null,
      granjaId: data.granjaId ?? null,
      granja: null,
      distrito: null,
      provincia: null,
      departamento: null,
      codigoDistrito: null,
      precioCompra: data.precioCompra ?? null,
      aptoPara: data.aptoPara,
      fechaEspecificacion: data.fechaEspecificacion,
      observaciones: data.observaciones?.trim() ?? null,
    };
  }
}
