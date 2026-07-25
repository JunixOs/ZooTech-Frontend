import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ServerTablePage } from '@shared/utils/server-table-state';
import { CeloApiService } from '../infrastructure/celo-api.service';
import {
  CeloRegistro,
  ComparacionRealVsEstandar,
  EditarCeloPayload,
  EliminarCeloPayload,
  RegistrarCeloRequest,
  VacaCelo,
} from '../domain/models/celo.model';
import {
  DetalleCeloPorVacuno,
  HistorialCeloPorVacuno,
  ReporteCeloPorVacuno,
  ResumenCeloPorVacuno,
} from '../domain/models/reporte-celo-vacuno.model';

@Injectable({ providedIn: 'root' })
export class CeloFacade {
  private readonly api = inject(CeloApiService);

  readonly celos = signal<CeloRegistro[]>([]);
  readonly celosTotalCount = signal(0);
  readonly vacasEnCelo = signal<VacaCelo[]>([]);
  readonly reporteCeloPorVacuno = signal<ReporteCeloPorVacuno[]>([]);
  readonly detalleCeloPorVacuno = signal<DetalleCeloPorVacuno[]>([]);
  readonly historialCeloPorVacuno = signal<HistorialCeloPorVacuno[]>([]);
  readonly resumenCeloPorVacuno = signal<ResumenCeloPorVacuno | null>(null);
  readonly encargadoCeloPorVacuno = signal<string | null>(null);
  readonly historialCeloLoading = signal(false);
  readonly historialCeloError = signal<string | null>(null);
  readonly comparacionRealVsEstandar = signal<ComparacionRealVsEstandar[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // `cargarCelos` y `cargarReporteCeloGeneral` escriben ambos sobre la misma señal
  // compartida `celos`; es seguro porque cada pantalla la invoca en momentos
  // distintos y cada llamada reemplaza el valor completo (no hay mezcla de datos).
  cargarCelos(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
    fechaInicio?: string;
    fechaFin?: string;
    columnFilters?: Record<string, string>;
  }): Observable<ServerTablePage<CeloRegistro>> {
    this.isLoading.set(true);
    this.error.set(null);

    // No se suscribe acá: la petición HTTP es "cold", así que suscribirse dos
    // veces (una acá y otra en el consumidor, p.ej. server-table-state) la
    // dispararía dos veces. `tap` actualiza las señales sobre la ÚNICA
    // suscripción que hace el consumidor.
    return this.api
      .listarCelos(
        params?.search,
        params?.page,
        params?.pageSize,
        params?.fechaInicio,
        params?.fechaFin,
        params?.columnFilters,
      )
      .pipe(
        tap({
          next: (result) => {
            this.celos.set(result.data);
            this.celosTotalCount.set(result.totalCount);
            this.isLoading.set(false);
          },
          error: (err: Error) => {
            this.error.set(err.message);
            this.isLoading.set(false);
          },
        }),
      );
  }

  cargarVacasEnCelo(fechaInicio?: string, fechaFin?: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.api.listarVacasEnCelo(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.vacasEnCelo.set(data);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      },
    });
  }
  cargarComparacionRealVsEstandar(
    fechaInicio?: string,
    fechaFin?: string,
  ): void {

    this.isLoading.set(true);
    this.error.set(null);

    this.api
      .listarComparacionRealVsEstandar(fechaInicio, fechaFin)
      .subscribe({
        next: (data) => {
          this.comparacionRealVsEstandar.set(data);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.isLoading.set(false);
        },
      });
  }

  registrarCelo(data: RegistrarCeloRequest): Observable<CeloRegistro> {
    return this.api.registrarCelo(data);
  }

  // No refrescamos acá: este facade no conoce la página/búsqueda actual (eso
  // vive en `server-table-state`, del lado del contenedor). Si dispará­ramos
  // `cargarCelos()` sin esos parámetros, resetearíamos al usuario a la
  // página 1 en vez de refrescar la página que estaba mirando. El consumidor
  // (p.ej. `CeloContainerComponent`) es responsable de llamar a
  // `tableState.reload()` tras un `actualizarCelo`/`eliminarCelo` exitoso.
  actualizarCelo(data: EditarCeloPayload): Observable<CeloRegistro> {
    return this.api.actualizarCelo(data);
  }

  eliminarCelo(data: EliminarCeloPayload): Observable<void> {
    return this.api.eliminarCelo(data);
  }

  cargarReporteCeloGeneral(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
    fechaInicio?: string;
    fechaFin?: string;
    columnFilters?: Record<string, string>;
  }): Observable<ServerTablePage<CeloRegistro>> {
    this.isLoading.set(true);
    this.error.set(null);

    // Ver comentario en `cargarCelos`: no nos suscribimos acá para no disparar
    // la petición HTTP dos veces.
    return this.api
      .obtenerReporteCeloGeneral(
        params?.search,
        params?.page,
        params?.pageSize,
        params?.fechaInicio,
        params?.fechaFin,
        params?.columnFilters,
      )
      .pipe(
        tap({
          next: (result) => {
            this.celos.set(result.data);
            this.celosTotalCount.set(result.totalCount);
            this.isLoading.set(false);
          },
          error: (err: Error) => {
            this.error.set(err.message);
            this.isLoading.set(false);
          },
        }),
      );
  }

  cargarReporteCeloPorVacuno(fechaInicio?: string, fechaFin?: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.obtenerReporteCeloPorVacuno(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.reporteCeloPorVacuno.set(data);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  cargarDetalleCeloPorVacuno(codigoVacuno: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.obtenerDetalleCeloPorVacuno(codigoVacuno).subscribe({
      next: (data) => {
        this.detalleCeloPorVacuno.set(data);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  cargarHistorialCeloPorVacuno(codigoVacuno: string, registroId: number): void {
    this.historialCeloLoading.set(true);
    this.historialCeloError.set(null);
    this.api.obtenerHistorialCeloPorVacuno(codigoVacuno, registroId).subscribe({
      next: (data) => {
        this.historialCeloPorVacuno.set(data.historial);
        this.resumenCeloPorVacuno.set(data.resumen);
        this.encargadoCeloPorVacuno.set(data.encargado);
        this.historialCeloLoading.set(false);
      },
      error: (err: Error) => {
        this.historialCeloError.set(err.message);
        this.historialCeloLoading.set(false);
      },
    });
  }

  limpiarDetalleCeloPorVacuno(): void {
    this.detalleCeloPorVacuno.set([]);
  }

  limpiarHistorialCeloPorVacuno(): void {
    this.historialCeloPorVacuno.set([]);
    this.resumenCeloPorVacuno.set(null);
    this.encargadoCeloPorVacuno.set(null);
    this.historialCeloError.set(null);
  }
}
