import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ReportLayoutComponent } from '@shared/components/report-layout/report-layout.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DateRange, ReportConfig } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-reportes-celo',
  standalone: true,
  imports: [ReportLayoutComponent, PageHeaderComponent],
  templateUrl: './reportes-celo.component.html',
  styleUrl: './reportes-celo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesCeloComponent {
  private readonly searchTerm = signal('');
  readonly dateRange = signal<DateRange>({ start: null, end: null });

  private readonly allReports: ReportConfig[] = [
    {
      title: 'reproduccion.celo.reportes.types.general.title',
      description: 'reproduccion.celo.reportes.types.general.description',
      icon: 'fa-solid fa-table-list',
      route: '/reproduccion/celo/reportes/general',
    },
    {
      title: 'reproduccion.celo.reportes.types.byCattle.title',
      description: 'reproduccion.celo.reportes.types.byCattle.description',
      icon: 'fa-solid fa-table-list',
      route: '/reproduccion/celo/reportes/por-vacuno',
    },
    {
      title: 'reproduccion.celo.reportes.types.realVsStandard.title',
      description: 'reproduccion.celo.reportes.types.realVsStandard.description',
      icon: 'fa-solid fa-chart-line',
      route: '/reproduccion/celo/reportes/comparacion-real-vs-estandar',
    },
    {
      title: 'reproduccion.celo.reportes.types.realVsStandardByCattle.title',
      description: 'reproduccion.celo.reportes.types.realVsStandardByCattle.description',
      icon: 'fa-solid fa-chart-line',
      route: '/reproduccion/celo/reportes/comparacion-por-vacuno',
    },
  ];

  readonly filteredReports = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.allReports;
    return this.allReports.filter(
      (r) => r.title.toLowerCase().includes(term) || r.description.toLowerCase().includes(term),
    );
  });

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onRangeChange(range: DateRange): void {
    this.dateRange.set(range);
  }
}
