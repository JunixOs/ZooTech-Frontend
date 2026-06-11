import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { ReportConfig, DateRange } from '@shared/models/report-config.model';
import { ReportesList } from './reporte-list/reporte-list';
import { ReportGridComponent } from "@shared/components/report-grid/report-grid.component";
import { DateRangeFilterComponent } from "@shared/components/date-range-filter/date-range-filter.component";
import { SearchInputComponent } from "@shared/components/search-input/search-input.component";
import { ReporteChartGeneral } from './reporte-chart-general/reporte-chart-general';

@Component({
  selector: 'zt-reporte-container',
  imports: [
    PageHeaderComponent, 
    ReportesList, 
    ReportGridComponent, 
    DateRangeFilterComponent, 
    SearchInputComponent,
    ReporteChartGeneral
  ],
  templateUrl: './reporte-container.html',
  styleUrl: './reporte-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {

  loading = signal(false);
  selectedReport = signal<string | null>(null);
  successMessage = signal<string>('');

  tempDateRange = signal<DateRange>({ start: null, end: null });
  appliedDateRange = signal<DateRange>({ start: null, end: null });
  defaultStartStr = '';
  defaultEndStr = '';

  constructor() {}

  pageTitle = computed(() => {
    const selected = this.selectedReport();
    if (selected === 'grafico-triaje-general') {
      return 'sanidad.reportes.charts.generalTriageTitle';
    }
    return 'sanidad.reportes.title';
  });

  pageBreadcrumb = computed(() => {
    const selected = this.selectedReport();
    if (selected === 'grafico-triaje-general') {
      return 'sanidad.reportes.charts.generalTriageBreadcrumb';
    }
    return 'sanidad.reportes.breadcrumb';
  });

  reports = signal<ReportConfig[]>([
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
  ]);

  volver() {
    this.selectedReport.set(null);
  }

  onRangeChange(range: DateRange) {
    this.tempDateRange.set(range);
  }

  onSearch(term: string) {
    console.log('búsqueda:', term); // TODO: implementar búsqueda
  }

  onDateRangeChange(range: DateRange): void {
    this.tempDateRange.set(range);
  }

  applyFilter(): void {
    this.appliedDateRange.set(this.tempDateRange());
  }

  onDownloadComplete(): void {
    this.successMessage.set('sanidad.reportes.descargaExito');
    this.selectedReport.set(null);
    setTimeout(() => {
      this.successMessage.set('');
    }, 3000);
  }
}