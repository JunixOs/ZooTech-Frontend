import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Routes } from '@angular/router';
import { ReportLayoutComponent } from '@shared/components/report-layout/report-layout.component';
import { ReportConfig, DateRange } from '@shared/models/report-config.model';
import { signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-leche-report',
  standalone: true,
  imports: [ReportLayoutComponent,TranslatePipe,],
  templateUrl: './leche-report.html',
  styleUrls: ['./leche-report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  
})
export class LecheReport implements OnInit {
  reports = signal<ReportConfig[]>([]);
  loading = signal(false);



  ngOnInit(): void {
    this.initializeReports();
  }

  private initializeReports(): void {
    this.reports.set([
      {
        title: 'Reporte de producción diaria',
        description: 'En este reporte nos mostrara una tabla con los registros de ordaños que se hicieron diariamente y estará en base a filtro de fechas que es especifico en la parte superior',
        icon: 'fa-solid fa-table',
        route: '/leche/reporte/produccion-diaria',
      },
      {
        title: 'Comparación de producción real vs standard',
        description: 'Estos reportes nos mostrará los registos de ordaños que se hicieron diariamente y estará en base a un filtro de fechas que es especifico en la parte superior',
        icon: 'fa-solid fa-chart-line',
        route: '/leche/reporte/produccion-vs-standard',
      },
      {
        title: 'Reporte de producción por vacuno',
        description: 'En este reporte nos mostrara una tabla con los registros de ordaños que se hicieron a las vacas. Se mostrara un listado de todas las vacas para que puedas seleccionar una en especifico',
        icon: 'fa-solid fa-table',
        route: '/leche/reporte/produccion-por-vacuno',
      },
      {
        title: 'Comparación de producción real vs standard por vacuno',
        description: 'Estos reportes nos mostrará los registos de ordaños que se hicieron diariamente y estará en base a un filtro de fechas que es especifico en la parte superior',
        icon: 'fa-solid fa-chart-line',
        route: '/leche/reporte/produccion-vs-standard-vacuno',
      },
      {
        title: 'Reporte de vacas en sequía',
        description: 'En este reporte nos mostrara tres tablas con especificando que vacas estuvieron en sequía, que vacas estan en sequia y que vacas en estaran en sequía aproximadamente los ultimos',
        icon: 'fa-solid fa-table',
        route: '/leche/reporte/vacas-sequia',
      },
    ]);
  }

  onRangeChange(range: DateRange): void {
    console.log('Filtro de fechas:', range);
    // Aquí irá la lógica para filtrar reportes por fechas
  }

  onSearch(query: string): void {
    console.log('Búsqueda:', query);
    // Aquí irá la lógica para buscar reportes
  }
}

/** Rutas internas del submódulo de Reportes de Leche */
export const LECHE_REPORT_ROUTES: Routes = [
  {
    path: '',
    component: LecheReport, // Ruta base: /leche/reporte (Muestra los cards)
  },
  {
    path: 'produccion-diaria',
    loadComponent: () =>
      import('../leche-report-daily/produccion-diaria-report').then((m) => m.ProduccionDiariaReport),
  },
  {
    path: 'produccion-vs-standard',
    loadComponent: () =>
      import('../leche-report-comparison/comparacion-produccion-report').then((m) => m.ComparacionProduccionReport),
  },
];