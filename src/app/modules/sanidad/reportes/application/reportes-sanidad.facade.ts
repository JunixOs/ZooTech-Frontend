import { Injectable, inject, signal } from '@angular/core';
import { ReportesSanidadApiService } from '../infrastructure/reportes-sanidad-api.service';
import {
  PesoPromedioItem,
  ResumenSanidad,
  TipoPesoCountItem,
} from '../domain/models/reportes-sanidad.model';

@Injectable({ providedIn: 'root' })
export class ReportesSanidadFacade {
  private readonly api = inject(ReportesSanidadApiService);

  readonly resumen = signal<ResumenSanidad | null>(null);
  readonly pesoPromedio = signal<PesoPromedioItem[]>([]);
  readonly distribucionTipoPeso = signal<TipoPesoCountItem[]>([]);
  readonly loading = signal(false);

  cargarResumen(fechaInicio?: string, fechaFin?: string): void {
    this.loading.set(true);
    this.api.getResumen(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cargarPesoPromedio(fechaInicio?: string, fechaFin?: string): void {
    this.loading.set(true);
    this.api.getPesoPromedio(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.pesoPromedio.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cargarDistribucionTipoPeso(fechaInicio?: string, fechaFin?: string): void {
    this.loading.set(true);
    this.api.getDistribucionTipoPeso(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.distribucionTipoPeso.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cargarTodos(fechaInicio?: string, fechaFin?: string): void {
    this.cargarResumen(fechaInicio, fechaFin);
    this.cargarPesoPromedio(fechaInicio, fechaFin);
    this.cargarDistribucionTipoPeso(fechaInicio, fechaFin);
  }
}
