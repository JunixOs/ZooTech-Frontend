import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ReportLayoutComponent } from '@shared/components/report-layout/report-layout.component';
import { ReportConfig, DateRange } from '@shared/models/report-config.model';
import { map } from 'rxjs';

@Component({
  selector: 'app-reporte-container',
  standalone: true,
  imports: [ReportLayoutComponent, RouterOutlet],
  templateUrl: './reporte-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {
  loading = signal(false);
    private readonly route = inject(ActivatedRoute);

  reports = signal<ReportConfig[]>([
    {
      title: 'sanidad.cards.reporteListadoGeneralTriaje.title',
      description: 'sanidad.cards.reporteListadoGeneralTriaje.description',
      icon: 'fa-solid fa-list', 
      route: '/sanidad/reportes/listadoGeneral',
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

    hasChildRoute = toSignal(
    this.route.firstChild
      ? this.route.firstChild.url.pipe(map(() => true))
      : this.route.url.pipe(map(() => false)),
    { initialValue: !!this.route.firstChild }
  );

  selectedReport: any;

  onDateRangeChange(range: DateRange) {}
  onSearch(term: string) {}
}