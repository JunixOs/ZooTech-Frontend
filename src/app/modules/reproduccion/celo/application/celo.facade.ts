import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CeloApiService } from '../infrastructure/celo-api.service';
import {
  CeloRegistro,
  EditarCeloPayload,
  EliminarCeloPayload,
  RegistrarCeloRequest,
  VacaCelo,
} from '../domain/models/celo.model';
import {
  DetalleCeloPorVacuno,
  ReporteCeloPorVacuno,
} from '../domain/models/reporte-celo-vacuno.model';

@Injectable({ providedIn: 'root' })
export class CeloFacade {
  private readonly api = inject(CeloApiService);

  readonly celos = signal<CeloRegistro[]>([]);
  readonly vacasEnCelo = signal<VacaCelo[]>([]);
  readonly reporteCeloPorVacuno = signal<ReporteCeloPorVacuno[]>([]);
  readonly detalleCeloPorVacuno = signal<DetalleCeloPorVacuno[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  cargarCelos(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.api.listarCelos().subscribe({
      next: (data) => {
        this.celos.set(data);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      },
    });
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

  registrarCelo(data: RegistrarCeloRequest): Observable<CeloRegistro> {
    return this.api.registrarCelo(data);
  }

  actualizarCelo(data: EditarCeloPayload): Observable<CeloRegistro> {
    return this.api.actualizarCelo(data).pipe(tap(() => this.cargarCelos()));
  }

  eliminarCelo(data: EliminarCeloPayload): Observable<void> {
    return this.api.eliminarCelo(data).pipe(tap(() => this.cargarCelos()));
  }

  cargarReporteCeloGeneral(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.obtenerReporteCeloGeneral().subscribe({
      next: (data) => {
        this.celos.set(data);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  cargarReporteCeloPorVacuno(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.obtenerReporteCeloPorVacuno().subscribe({
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

  limpiarDetalleCeloPorVacuno(): void {
    this.detalleCeloPorVacuno.set([]);
  }
}
