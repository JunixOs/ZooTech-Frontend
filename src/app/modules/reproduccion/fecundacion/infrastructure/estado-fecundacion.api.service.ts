import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '@core/api/api.config';
import { EstadoFecundacionVacuno, UltimoRegistroFecundacion } from '../domain/models/fecundacion.model';

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
  estadoActual: string;
  EstadoActual: string;
  estadoReproductivoActual: string;
  EstadoReproductivoActual: string;
  disponibleNuevaFecundacion: boolean;
  DisponibleNuevaFecundacion: boolean;
  ultimaActualizacion: string;
  UltimaActualizacion: string;
  codigoFecundacion: string | null;
  CodigoFecundacion: string | null;
  tipoFecundacion: string | null;
  TipoFecundacion: string | null;
  toroDonante: string | null;
  ToroDonante: string | null;
  responsable: string | null;
  Responsable: string | null;
  fechaProcedimiento: string | null;
  FechaProcedimiento: string | null;
  resultado: string | null;
  Resultado: string | null;
  observaciones: string | null;
  Observaciones: string | null;
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
    estadoFecundacion: string,
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
    const codigoFecundacion = data.codigoFecundacion ?? data.CodigoFecundacion ?? null;
    const tipoFecundacion = data.tipoFecundacion ?? data.TipoFecundacion ?? null;
    const toroDonante = data.toroDonante ?? data.ToroDonante ?? null;
    const responsable = data.responsable ?? data.Responsable ?? null;
    const fechaProcedimiento = data.fechaProcedimiento ?? data.FechaProcedimiento ?? null;
    const resultado = data.resultado ?? data.Resultado ?? null;
    const observaciones = data.observaciones ?? data.Observaciones ?? null;

    return {
      vacunoId: data.vacunoId ?? data.VacunoId,
      fecundacionId: data.fecundacionId ?? data.FecundacionId ?? null,
      codigoVacuno: data.codigoVacuno ?? data.CodigoVacuno ?? '',
      nombreVacuno: data.nombreVacuno ?? data.NombreVacuno ?? '',
      raza: data.raza ?? data.Raza ?? '',
      estadoReproductivoActual:
        data.estadoActual ?? data.EstadoActual ?? data.estadoReproductivoActual ?? data.EstadoReproductivoActual ?? 'Sin estado',
      disponibleNuevaFecundacion: data.disponibleNuevaFecundacion ?? data.DisponibleNuevaFecundacion ?? false,
      ultimaActualizacion: data.ultimaActualizacion ?? data.UltimaActualizacion ?? '',
      ultimoRegistroActivo: codigoFecundacion
        ? this.mapRegistro({
            codigoFecundacion,
            tipoFecundacion,
            toroDonante,
            fechaProcedimiento,
            responsable,
            resultado,
            observaciones,
          })
        : null,
    };
  }

  private unwrapResponse(
    response: ApiEnvelope<EstadoFecundacionApiResponse> | EstadoFecundacionApiResponse,
  ): EstadoFecundacionApiResponse {
    if (this.isEnvelope(response)) {
      return response.data ?? response.Data ?? {};
    }

    return response as EstadoFecundacionApiResponse;
  }

  private isEnvelope(
    response: ApiEnvelope<EstadoFecundacionApiResponse> | EstadoFecundacionApiResponse,
  ): response is ApiEnvelope<EstadoFecundacionApiResponse> {
    return 'data' in response || 'Data' in response;
  }

  private mapRegistro(data: {
    codigoFecundacion: string;
    tipoFecundacion: string | null;
    toroDonante: string | null;
    fechaProcedimiento: string | null;
    responsable: string | null;
    resultado: string | null;
    observaciones: string | null;
  }): UltimoRegistroFecundacion {
    return {
      codigoRegistro: data.codigoFecundacion,
      activo: true,
      tipoFecundacion: data.tipoFecundacion ?? '',
      vacunoReceptor: '',
      toroDonante: data.toroDonante ?? '',
      fechaProcedimiento: data.fechaProcedimiento ?? '',
      responsable: data.responsable ?? '',
      resultadoRegistrado: data.resultado ?? '',
      observacionesVeterinarias: data.observaciones ?? '',
    };
  }
}
