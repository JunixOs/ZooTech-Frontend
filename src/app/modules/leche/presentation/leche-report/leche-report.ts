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
  styleUrls: ['./leche-report.css'],
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
        title: 'leche.reportes.cards.daily.title',
        description: 'leche.reportes.cards.daily.description',
        icon: 'fa-solid fa-table',
        route: '/leche/reporte/produccion-diaria',
      },
      {
        title: 'leche.reportes.cards.comparison.title',
        description: 'leche.reportes.cards.comparison.description',
        icon: 'fa-solid fa-chart-line',
        route: '/leche/reporte/produccion-vs-standard',
      },
      {
        title: 'leche.reportes.cards.byCattle.title',
        description: 'leche.reportes.cards.byCattle.description',
        icon: 'fa-solid fa-table',
        route: '/leche/reporte/produccion-por-vacuno',
      },
      {
        title: 'leche.reportes.cards.comparisonByCattle.title',
        description: 'leche.reportes.cards.comparisonByCattle.description',
        icon: 'fa-solid fa-chart-line',
        route: '/leche/reporte/produccion-vs-standard-vacuno',
      },
      {
        title: 'leche.reportes.cards.dryCows.title',
        description: 'leche.reportes.cards.dryCows.description',
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
    component: LecheReport,
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
  {
    path: 'produccion-por-vacuno',
    loadComponent: () =>
      import('../leche-report-produccion-por-vacuno/produccion-vacuno-report').then(
        (m) => m.ProduccionVacunoReport,
      ),
  },
  {
    path: 'produccion-por-vacuno/:codigo',
    loadComponent: () =>
      import('../leche-report-produccion-por-vacuno/detalle-vacuno-report').then(
        (m) => m.DetalleVacunoReport,
      ),
  },
  {
    path: 'produccion-vs-standard-vacuno',
    loadComponent: () =>
      import('../leche-report-comparision-produccion-vacuno/produccion-vacuno-report').then(
        (m) => m.ProduccionVacunoReport,
      ),
  },
  {
    path: 'produccion-vs-standard-vacuno/:codigo',
    loadComponent: () =>
      import('../leche-report-comparision-produccion-vacuno/detalle-vacuno-report').then(
        (m) => m.DetalleVacunoReport,
      ),
  },
];
