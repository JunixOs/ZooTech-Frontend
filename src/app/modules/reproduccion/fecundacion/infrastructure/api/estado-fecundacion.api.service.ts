import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '@core/api/api.config';
import {
  EstadoFecundacion,
  EstadoFecundacionVacuno,
  TipoFecundacion,
  UltimoRegistroFecundacion,
} from '../../domain/models/fecundacion.model';

type ApiEnvelope<T> = { data?: T; Data?: T };

type EstadoFecundacionApiResponse = Partial<{
  vacunoId: number | string;
  VacunoId: number | string;
  fecundacionId: number | string | null;
  FecundacionId: number | string | null;
  codigoVacuno: string;
  CodigoVacuno: string;
  nombreVacuno: string;
  NombreVacuno: string;
  raza: string;
  Raza: string;
  estadoReproductivoActual: EstadoFecundacion;
  EstadoReproductivoActual: EstadoFecundacion;
  estadoFecundacion: EstadoFecundacion;
  EstadoFecundacion: EstadoFecundacion;
  disponibleNuevaFecundacion: boolean;
  DisponibleNuevaFecundacion: boolean;
  ultimaActualizacion: string;
  UltimaActualizacion: string;
  ultimoRegistroActivo: UltimoRegistroFecundacionApiResponse | null;
  UltimoRegistroActivo: UltimoRegistroFecundacionApiResponse | null;
}>;

type UltimoRegistroFecundacionApiResponse = Partial<{
  codigoRegistro: string;
  CodigoRegistro: string;
  activo: boolean;
  Activo: boolean;
  tipoFecundacion: TipoFecundacion;
  TipoFecundacion: TipoFecundacion;
  vacunoReceptor: string;
  VacunoReceptor: string;
  toroDonante: string;
  ToroDonante: string;
  fechaProcedimiento: string;
  FechaProcedimiento: string;
  responsable: string;
  Responsable: string;
  resultadoRegistrado: string;
  ResultadoRegistrado: string;
  observacionesVeterinarias: string;
  ObservacionesVeterinarias: string;
}>;

@Injectable({ providedIn: 'root' })
export class EstadoFecundacionApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private get baseUrl(): string {
    const marker = '/api';
    const apiIndex = this.apiBaseUrl.toLowerCase().lastIndexOf(marker);
    const apiRoot = apiIndex >= 0 ? this.apiBaseUrl.slice(0, apiIndex + marker.length) : this.apiBaseUrl;
    return `${apiRoot}/reproduccion/fecundacion/estado`;
  }

  obtenerEstado(vacunoId: number | string): Observable<EstadoFecundacionVacuno> {
    return this.http
      .get<ApiEnvelope<EstadoFecundacionApiResponse> | EstadoFecundacionApiResponse>(
        `${this.baseUrl}/${encodeURIComponent(String(vacunoId))}`,
      )
      .pipe(map((response) => this.mapEstado(response)));
  }

  actualizarEstado(
    fecundacionId: number | string,
    estadoFecundacion: EstadoFecundacion,
  ): Observable<EstadoFecundacionVacuno> {
    return this.http
      .put<ApiEnvelope<EstadoFecundacionApiResponse> | EstadoFecundacionApiResponse>(
        `${this.baseUrl}/${encodeURIComponent(String(fecundacionId))}`,
        { estadoFecundacion },
      )
      .pipe(map((response) => this.mapEstado(response)));
  }

  private mapEstado(
    response: ApiEnvelope<EstadoFecundacionApiResponse> | EstadoFecundacionApiResponse,
  ): EstadoFecundacionVacuno {
    const data = this.unwrapResponse(response);
    const estado =
      data.estadoReproductivoActual ?? data.EstadoReproductivoActual ?? data.estadoFecundacion ?? data.EstadoFecundacion ?? 'sin_estado';

    return {
      vacunoId: data.vacunoId ?? data.VacunoId,
      fecundacionId: data.fecundacionId ?? data.FecundacionId ?? null,
      codigoVacuno: data.codigoVacuno ?? data.CodigoVacuno ?? '',
      nombreVacuno: data.nombreVacuno ?? data.NombreVacuno ?? '',
      raza: data.raza ?? data.Raza ?? '',
      estadoReproductivoActual: estado,
      disponibleNuevaFecundacion:
        data.disponibleNuevaFecundacion ?? data.DisponibleNuevaFecundacion ?? this.esDisponible(estado),
      ultimaActualizacion: data.ultimaActualizacion ?? data.UltimaActualizacion ?? '',
      ultimoRegistroActivo: this.mapRegistro(data.ultimoRegistroActivo ?? data.UltimoRegistroActivo ?? null),
    };
  }

  private unwrapResponse(
    response: ApiEnvelope<EstadoFecundacionApiResponse> | EstadoFecundacionApiResponse,
  ): EstadoFecundacionApiResponse {
    if (this.isEnvelope(response)) {
      return response.data ?? response.Data ?? {};
    }

    return response;
  }

  private isEnvelope(
    response: ApiEnvelope<EstadoFecundacionApiResponse> | EstadoFecundacionApiResponse,
  ): response is ApiEnvelope<EstadoFecundacionApiResponse> {
    return 'data' in response || 'Data' in response;
  }

  private mapRegistro(registro: UltimoRegistroFecundacionApiResponse | null): UltimoRegistroFecundacion | null {
    if (!registro) {
      return null;
    }

    return {
      codigoRegistro: registro.codigoRegistro ?? registro.CodigoRegistro ?? '',
      activo: registro.activo ?? registro.Activo ?? false,
      tipoFecundacion: registro.tipoFecundacion ?? registro.TipoFecundacion ?? 'IA',
      vacunoReceptor: registro.vacunoReceptor ?? registro.VacunoReceptor ?? '',
      toroDonante: registro.toroDonante ?? registro.ToroDonante ?? '',
      fechaProcedimiento: registro.fechaProcedimiento ?? registro.FechaProcedimiento ?? '',
      responsable: registro.responsable ?? registro.Responsable ?? '',
      resultadoRegistrado: registro.resultadoRegistrado ?? registro.ResultadoRegistrado ?? '',
      observacionesVeterinarias:
        registro.observacionesVeterinarias ?? registro.ObservacionesVeterinarias ?? '',
    };
  }

  private esDisponible(estado: EstadoFecundacion): boolean {
    return estado === 'fallida' || estado === 'sin_estado';
  }
}
