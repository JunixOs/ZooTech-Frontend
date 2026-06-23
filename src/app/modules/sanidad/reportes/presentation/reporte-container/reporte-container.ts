import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ReportLayoutComponent } from '@shared/components/report-layout/report-layout.component';
import { ReportConfig, DateRange } from '@shared/models/report-config.model';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';

@Component({
  selector: 'zt-reporte-container',
  standalone: true,
  imports: [ReportLayoutComponent, RouterOutlet, PageHeaderComponent],
  templateUrl: './reporte-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {
  private readonly router = inject(Router);

  loading = signal(false);
  hasChildRoute = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url !== '/sanidad/reportes'),
    ),
    { initialValue: false },
  );
  selectedReport = signal<string | null>(null);
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

  volver() {
    this.selectedReport.set(null);
  }

  onRangeChange(range: DateRange) {
    console.log('rango:', range); // TODO: implementar filtro
  }

  onSearch(term: string) {
    console.log('búsqueda:', term); // TODO: implementar búsqueda
  }

  onDateRangeChange(range: DateRange): void {
    console.log('Rango seleccionado (pendiente endpoint):', range);
  }
}
