import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Routes } from '@angular/router';
import { ReportLayoutComponent } from '@shared/components/report-layout/report-layout.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ReportConfig, DateRange } from '@shared/models/report-config.model';
import { signal } from '@angular/core';

@Component({
  selector: 'zt-leche-report',
  standalone: true,
  imports: [ReportLayoutComponent, PageHeaderComponent],
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
        title: 'leche.reports.cards.daily.title',
        description: 'leche.reports.cards.daily.description',
        icon: 'fa-solid fa-table',
        route: '/leche/reporte/produccion-diaria',
      },
      {
        title: 'leche.reports.cards.realVsStandard.title',
        description: 'leche.reports.cards.realVsStandard.description',
        icon: 'fa-solid fa-chart-line',
        route: '/leche/reporte/produccion-vs-standard',
      },
      {
        title: 'leche.reports.cards.byCattle.title',
        description: 'leche.reports.cards.byCattle.description',
        icon: 'fa-solid fa-table',
        route: '/leche/reporte/produccion-por-vacuno',
      },
      {
        title: 'leche.reports.cards.realVsStandardByCattle.title',
        description: 'leche.reports.cards.realVsStandardByCattle.description',
        icon: 'fa-solid fa-chart-line',
        route: '/leche/reporte/produccion-vs-standard-vacuno',
      },
      {
        title: 'leche.reports.cards.dryCows.title',
        description: 'leche.reports.cards.dryCows.description',
        icon: 'fa-solid fa-table',
        route: '/leche/reporte/vacas-sequia',
      },
    ]);
  }

  onRangeChange(range: DateRange): void {
    // Aquí irá la lógica para filtrar reportes por fechas
  }

  onSearch(query: string): void {
    // Aquí irá la lógica para buscar reportes
  }
}
