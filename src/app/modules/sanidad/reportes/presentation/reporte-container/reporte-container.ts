import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { ReportConfig, DateRange } from '@shared/models/report-config.model';
import { ReportesList } from './reporte-list/reporte-list';
import { ReporteTriajeVacuno } from './reporte-triaje-vacuno/reporte-triaje-vacuno';

import { ReportGridComponent } from "@shared/components/report-grid/report-grid.component";
import { DateRangeFilterComponent } from "@shared/components/date-range-filter/date-range-filter.component";
import { SearchInputComponent } from "@shared/components/search-input/search-input.component";
import { ReportLayoutComponent } from "@shared/components/report-layout/report-layout.component";
@Component({
  selector: 'zt-reporte-container',
  imports: [PageHeaderComponent, ReportesList, ReportLayoutComponent, ReporteTriajeVacuno, ReportGridComponent, DateRangeFilterComponent, SearchInputComponent],
  templateUrl: './reporte-container.html',
  styleUrl: './reporte-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {

  loading = signal(false);
  selectedReport = signal<string | null>(null);

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
  console.log('rango:', range); // TODO: implementar filtro
}
onSearch(term: string) {
  console.log('búsqueda:', term); // TODO: implementar búsqueda
}
}

