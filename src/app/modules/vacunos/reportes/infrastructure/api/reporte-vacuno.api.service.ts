import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/api/api.config';
import { Observable, map } from 'rxjs';
import {
  RegistroVacunoReporteResponse,
  ReporteFormato,
  ReporteVacunoListadoFiltros,
  ReporteVacunoListadoResponse,
  VacunoListadoItem,
} from '../../domain/models/reporte-vacuno.model';

@Injectable({ providedIn: 'root' })
export class ReporteVacunoApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listar(filtros: ReporteVacunoListadoFiltros): Observable<ReporteVacunoListadoResponse> {
    return this.http
      .get<AnimalsReportApiResponse>(this.animalsReportUrl, {
        params: this.toBackendParams(filtros),
      })
      .pipe(map((response) => this.mapListadoResponse(response)));
  }

  descargarListado(
    formato: Exclude<ReporteFormato, 'json'>,
    filtros: ReporteVacunoListadoFiltros,
  ): Observable<Blob> {
    const endpoint = formato === 'excel' ? 'excel' : 'pdf';

    return this.http.get(`${this.animalsReportUrl}/${endpoint}`, {
      params: this.toBackendParams(filtros),
      responseType: 'blob',
    });
  }

  obtenerRegistro(vacunoId: number, formato: ReporteFormato): Observable<RegistroVacunoReporteResponse> {
    const params = new HttpParams().set('formato', formato);

    return this.http.get<RegistroVacunoReporteResponse>(`${this.apiBaseUrl}/vacunos/${vacunoId}/reporte`, {
      params,
    });
  }

  toAbsoluteDownloadUrl(downloadUrl: string | null): string | null {
    if (!downloadUrl) return null;
    if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) return downloadUrl;
    return `${this.getDownloadBaseUrl()}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
  }

  private getDownloadBaseUrl(): string {
    return this.apiBaseUrl.replace(/\/api\/?$/, '');
  }

  private get reportsApiBaseUrl(): string {
    return this.apiBaseUrl.replace(/\/api\/v\d+\/?$/, '/api').replace(/\/$/, '');
  }

  private get animalsReportUrl(): string {
    return `${this.reportsApiBaseUrl}/reports/animals`;
  }

  private toBackendParams(filtros: ReporteVacunoListadoFiltros): HttpParams {
    const params: Record<string, string | number | undefined> = {
      FechaInicio: filtros.FechaInicio ?? filtros.fechaDesde,
      FechaFin: filtros.FechaFin ?? filtros.fechaHasta,
      Keyword: filtros.Keyword ?? filtros.q,
      RazaCode: filtros.RazaCode ?? filtros.raza,
      SexoCode: filtros.SexoCode ?? filtros.sexo,
      TipoAdquisicionCode: filtros.TipoAdquisicionCode ?? filtros.tipoAdquisicion,
      GranjaId: filtros.GranjaId ?? filtros.granja,
      EstadoCode: filtros.EstadoCode ?? filtros.estado,
    };

    return Object.entries(params).reduce((httpParams, [key, value]) => {
      if (value === undefined || value === null || value === '') {
        return httpParams;
      }

      return httpParams.set(key, String(value));
    }, new HttpParams());
  }

  private mapListadoResponse(response: AnimalsReportApiResponse): ReporteVacunoListadoResponse {
    const data = Array.isArray(response) ? response : response.items ?? response.Items ?? response.data ?? response.Data ?? [];
    const total = Array.isArray(response)
      ? response.length
      : response.total ?? response.Total ?? response.resumen?.totalVacunos ?? response.Resumen?.TotalVacunos ?? data.length;

    return {
      data: data.map((item) => this.mapListadoItem(item)),
      resumen: { totalVacunos: total },
      filtros: Array.isArray(response) ? {} : response.filtros ?? response.Filtros ?? {},
      downloadUrl: Array.isArray(response) ? null : response.downloadUrl ?? response.DownloadUrl ?? null,
    };
  }

  private mapListadoItem(item: AnimalReportApiItem): VacunoListadoItem {
    return {
      id: item.id ?? item.Id,
      codigo: item.codigo ?? item.Codigo ?? '',
      nombre: item.nombre ?? item.Nombre ?? '',
      fechaNacimiento: item.fechaNacimiento ?? item.FechaNacimiento ?? null,
      tipoAdquisicion: item.tipoAdquisicion ?? item.TipoAdquisicion ?? null,
      raza: item.raza ?? item.Raza ?? null,
      color: item.color ?? item.Color ?? null,
      sexo: item.sexo ?? item.Sexo ?? null,
      granja: item.granja ?? item.Granja ?? null,
      estado: item.estado ?? item.Estado ?? '',
      fechaRegistro: item.fechaRegistro ?? item.FechaRegistro ?? '',
    };
  }
}

type AnimalsReportApiResponse =
  | AnimalReportApiItem[]
  | {
      data?: AnimalReportApiItem[];
      Data?: AnimalReportApiItem[];
      items?: AnimalReportApiItem[];
      Items?: AnimalReportApiItem[];
      total?: number;
      Total?: number;
      resumen?: { totalVacunos?: number };
      Resumen?: { TotalVacunos?: number };
      filtros?: ReporteVacunoListadoResponse['filtros'];
      Filtros?: ReporteVacunoListadoResponse['filtros'];
      downloadUrl?: string | null;
      DownloadUrl?: string | null;
    };

interface AnimalReportApiItem {
  id?: number;
  Id?: number;
  codigo?: string;
  Codigo?: string;
  nombre?: string;
  Nombre?: string;
  fechaNacimiento?: string | null;
  FechaNacimiento?: string | null;
  tipoAdquisicion?: string | null;
  TipoAdquisicion?: string | null;
  raza?: string | null;
  Raza?: string | null;
  color?: string | null;
  Color?: string | null;
  sexo?: string | null;
  Sexo?: string | null;
  granja?: string | null;
  Granja?: string | null;
  estado?: string;
  Estado?: string;
  fechaRegistro?: string | null;
  FechaRegistro?: string | null;
}
