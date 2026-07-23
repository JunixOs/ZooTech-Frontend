import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Observable } from 'rxjs';
import {
  RegistroVacunoReporteResponse,
  ReporteFormato,
  ReporteVacunoListadoFiltros,
  ReporteVacunoListadoResponse,
  VacunoListadoItem,
} from '../../domain/models/reporte-vacuno.model';
import { ReporteVacunoApiService } from '../../infrastructure/api/reporte-vacuno.api.service';

@Injectable({ providedIn: 'root' })
export class ReporteVacunoFacade {
  private readonly api = inject(ReporteVacunoApiService);
  private readonly translate = inject(TranslateService);

  private readonly items = signal<VacunoListadoItem[]>([]);
  private readonly total = signal(0);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);
  private readonly registro = signal<RegistroVacunoReporteResponse | null>(null);

  readonly itemsSignal = computed(() => this.items());
  readonly totalSignal = computed(() => this.total());
  readonly loadingSignal = computed(() => this.loading());
  readonly errorSignal = computed(() => this.error());
  readonly registroSignal = computed(() => this.registro());

  async cargarListado(filtros: ReporteVacunoListadoFiltros): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.api.listar({ formato: 'json', page: 1, pageSize: 10, ...filtros }),
      );

      this.items.set(response.data ?? []);
      this.total.set(response.totalCount ?? response.resumen?.totalVacunos ?? response.data?.length ?? 0);
    } catch {
      this.items.set([]);
      this.total.set(0);
      this.error.set(this.translate.instant('vacunos.reportes.errors.list'));
    } finally {
      this.loading.set(false);
    }
  }

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
  ): Promise<string | null> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.api.listar({
          ...filtros,
          formato,
        }),
      );

      return this.api.toAbsoluteDownloadUrl(response.downloadUrl);
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

  descargarBlobExcel(filtros: Partial<ReporteVacunoListadoFiltros>): Observable<Blob> {
    return this.api.descargarExcel(filtros);
  }

  descargarBlobPdf(filtros: Partial<ReporteVacunoListadoFiltros>): Observable<Blob> {
    return this.api.descargarPdf(filtros);
  }

  async generarArchivo(
    vacunoId: number,
    formato: Exclude<ReporteFormato, 'json'>,
  ): Promise<string | null> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.obtenerRegistro(vacunoId, formato));
      this.registro.set(response);
      return this.api.toAbsoluteDownloadUrl(response.downloadUrl);
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
