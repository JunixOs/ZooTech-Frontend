import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ReportConfig, DateRange } from '@shared/models/report-config.model';
import { ReportesList } from './reporte-list/reporte-list';
import { ReportGridComponent } from '@shared/components/report-grid/report-grid.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { ReporteChartGeneral } from './reporte-chart-general/reporte-chart-general';
import { ReportesChartVacuno } from './reporte-chart-vacuno/reporte-chart-vacuno';
import { ReportesDetail } from './reporte-detail/reporte-detail';
import { ReporteDashboard } from '../reporte-dashboard/reporte-dashboard';
import { ReportePesoPromedio } from '../reporte-peso-promedio/reporte-peso-promedio';
import { ReporteDistribucion } from '../reporte-distribucion/reporte-distribucion';
import { ReporteTendencia } from '../reporte-tendencia/reporte-tendencia';
import { Triaje, TriajeHistorialItem } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { TriajeService } from '@modules/sanidad/services/triaje.service';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { TriajeForm } from '../../../triaje/presentation/triaje-container/triaje-form/triaje-form';
import { ToastService } from '@core/notifications/toast.service';

@Component({
  selector: 'zt-reporte-container',
  imports: [
    PageHeaderComponent,
    ReportesList,
    ReportGridComponent,
    DateRangeFilterComponent,
    SearchInputComponent,
    ReporteChartGeneral,
    ReportesChartVacuno,
    ReportesDetail,
    ReporteDashboard,
    ReportePesoPromedio,
    ReporteDistribucion,
    ReporteTendencia,
    ModalComponent,
    TriajeForm,
    TranslatePipe,
  ],
  templateUrl: './reporte-container.html',
  styleUrl: './reporte-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {
  private readonly triajeService = inject(TriajeService);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  loading = signal(false);
  selectedReport = signal<string | null>(null);
  successMessage = signal<string>('');

  tempDateRange = signal<DateRange>({ start: null, end: null });
  appliedDateRange = signal<DateRange>({ start: null, end: null });

  pageTitle = computed(() => {
    const selected = this.selectedReport();
    if (selected === 'resumen') return 'sanidad.reportes.dashboard.title';
    if (selected === 'grafico-triaje-general') return 'sanidad.reportes.charts.generalTriageTitle';
    if (selected === 'grafico-triaje-vacuno') return 'sanidad.reportes.charts.vacunoTitle';
    if (selected === 'listado-triaje-vacuno') return 'sanidad.reportes.charts.listadoVacunoTitle';
    if (selected === 'listado-triajes') return 'sanidad.reportes.charts.listadoTitle';
    if (selected === 'peso-promedio') return 'sanidad.reportes.pesoPromedio.title';
    if (selected === 'distribucion-tipo-peso') return 'sanidad.reportes.distribucion.title';
    if (selected === 'tendencia') return 'sanidad.reportes.tendencia.title';
    return 'sanidad.reportes.title';
  });

  pageBreadcrumb = computed(() => {
    if (this.selectedReport()) return 'sanidad.reportes.breadcrumb';
    return 'sanidad.reportes.breadcrumb';
  });

  reports = signal<ReportConfig[]>([
    {
      title: 'sanidad.reports.dashboard.title',
      description: 'sanidad.reports.dashboard.description',
      icon: 'fa-solid fa-gauge-high',
      onOpen: () => this.selectedReport.set('resumen'),
    },
    {
      title: 'sanidad.cards.reporteListadoGeneralTriaje.title',
      description: 'sanidad.cards.reporteListadoGeneralTriaje.description',
      icon: 'fa-solid fa-list',
      onOpen: () => this.selectedReport.set('listado-triajes'),
    },
    {
      title: 'sanidad.cards.graficoTriajeVacuno.title',
      description: 'sanidad.cards.graficoTriajeVacuno.description',
      icon: 'fa-solid fa-chart-line',
      onOpen: () => this.selectedReport.set('grafico-triaje-vacuno'),
    },
    {
      title: 'sanidad.cards.reporteListadoTriajeVacuno.title',
      description: 'sanidad.cards.reporteListadoTriajeVacuno.description',
      icon: 'fa-solid fa-cow',
      onOpen: () => this.selectedReport.set('listado-triaje-vacuno'),
    },
    {
      title: 'sanidad.cards.graficoTriajeGeneral.title',
      description: 'sanidad.cards.graficoTriajeGeneral.description',
      icon: 'fa-solid fa-chart-gantt',
      onOpen: () => this.selectedReport.set('grafico-triaje-general'),
    },
    {
      title: 'sanidad.reports.pesoPromedio.title',
      description: 'sanidad.reports.pesoPromedio.description',
      icon: 'fa-solid fa-chart-simple',
      onOpen: () => this.selectedReport.set('peso-promedio'),
    },
    {
      title: 'sanidad.reports.distribucion.title',
      description: 'sanidad.reports.distribucion.description',
      icon: 'fa-solid fa-chart-pie',
      onOpen: () => this.selectedReport.set('distribucion-tipo-peso'),
    },
    {
      title: 'sanidad.reports.tendencia.title',
      description: 'sanidad.reports.tendencia.description',
      icon: 'fa-solid fa-chart-scatter',
      onOpen: () => this.selectedReport.set('tendencia'),
    },
  ]);

  listadoRecargar = signal(0);

  // View triaje modal
  showViewTriage = signal(false);
  selectedTriaje = signal<Triaje | null>(null);
  historial = signal<TriajeHistorialItem[]>([]);

  volver(): void {
    this.selectedReport.set(null);
  }

  onRangeChange(range: DateRange): void {
    this.tempDateRange.set(range);
  }

  onSearch(term: string): void {
    this.listadoRecargar.update((v) => v + 1);
  }

  onDateRangeChange(range: DateRange): void {
    this.tempDateRange.set(range);
  }

  applyFilter(): void {
    this.appliedDateRange.set(this.tempDateRange());
    this.listadoRecargar.update((v) => v + 1);
  }

  onDownloadComplete(): void {
    this.successMessage.set('sanidad.reportes.descargaExito');
    this.selectedReport.set(null);
    setTimeout(() => {
      this.successMessage.set('');
    }, 3000);
  }

  onVerTriaje(triaje: Triaje): void {
    this.triajeService.getById(triaje.id).subscribe({
      next: (data) => {
        this.selectedTriaje.set(data);
        this.triajeService.getHistorialByVacunoId(data.vacunoId).subscribe({
          next: (historial) => {
            this.historial.set(historial);
            this.showViewTriage.set(true);
          },
          error: () => {
            this.historial.set([]);
            this.showViewTriage.set(true);
          },
        });
      },
      error: () => {
        this.toastService.error(this.translate.instant('sanidad.triaje.mensajes.errorCargar'));
      },
    });
  }

  closeViewTriage(): void {
    this.showViewTriage.set(false);
    this.selectedTriaje.set(null);
    this.historial.set([]);
  }
}
