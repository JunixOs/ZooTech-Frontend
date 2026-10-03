import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Observable } from 'rxjs';
import {
  ReporteArchivoDescargado,
  RegistroVacunoReporteResponse,
  ReporteFormato,
  ReporteVacunoListadoFiltros,
  ReporteVacunoListadoResponse,
} from '../../domain/models/reporte-vacuno.model';
import { ReporteVacunoService } from '../../infrastructure/services/reporte-vacuno.service';

@Injectable({ providedIn: 'root' })
export class ReporteVacunoFacade {
  private readonly api = inject(ReporteVacunoService);
  private readonly translate = inject(TranslateService);

  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);
  private readonly registro = signal<RegistroVacunoReporteResponse | null>(null);

  readonly loadingSignal = computed(() => this.loading());
  readonly errorSignal = computed(() => this.error());
  readonly registroSignal = computed(() => this.registro());

  async cargarRegistro(vacunoId: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.registro.set(null);

    try {
      const response = await firstValueFrom(this.api.obtenerRegistro(vacunoId, 'json'));
      this.registro.set(response);
    } catch {
      this.error.set(this.translate.instant('vacunos.reportes.errors.detail'));
    } finally {
      this.loading.set(false);
    }
  }

  listar(filtros: ReporteVacunoListadoFiltros): Observable<ReporteVacunoListadoResponse> {
    return this.api.listar(filtros);
  }

  async generarListadoArchivo(
    filtros: ReporteVacunoListadoFiltros,
    formato: Exclude<ReporteFormato, 'json'>,
  ): Promise<ReporteArchivoDescargado | null> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.api.listar({
          ...filtros,
          formato,
        }),
      );

      if (!response.downloadUrl) {
        throw new Error('El backend no devolvió una URL de descarga.');
      }

      return await firstValueFrom(this.api.descargarArchivo(response.downloadUrl));
    } catch {
      this.error.set(
        this.translate.instant('vacunos.reportes.errors.generateFile', {
          formato: formato.toUpperCase(),
        }),
      );
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async generarArchivo(
    vacunoId: number,
    formato: Exclude<ReporteFormato, 'json'>,
  ): Promise<ReporteArchivoDescargado | null> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.obtenerRegistro(vacunoId, formato));
      this.registro.set(response);
      if (!response.downloadUrl) {
        throw new Error('El backend no devolvió una URL de descarga.');
      }

      return await firstValueFrom(this.api.descargarArchivo(response.downloadUrl));
    } catch {
      this.error.set(
        this.translate.instant('vacunos.reportes.errors.generateFile', {
          formato: formato.toUpperCase(),
        }),
      );
      return null;
    } finally {
      this.loading.set(false);
    }
  }
}
