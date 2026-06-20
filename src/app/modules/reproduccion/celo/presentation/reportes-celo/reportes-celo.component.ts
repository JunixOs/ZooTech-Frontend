import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ReportLayoutComponent } from '@shared/components/report-layout/report-layout.component';
import { DateRange, ReportConfig } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-reportes-celo',
  standalone: true,
  imports: [TranslatePipe, ReportLayoutComponent],
  templateUrl: './reportes-celo.component.html',
  styleUrl: './reportes-celo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesCeloComponent {
  private readonly searchTerm = signal('');
  readonly dateRange = signal<DateRange>({ start: null, end: null });

  private readonly allReports: ReportConfig[] = [
    {
      title: 'Reporte de celo general',
      description:
        'En este reporte nos mostrará una tabla con los registros de los vacunos que estuvieron en celo.',
      icon: 'fa-solid fa-table-list',
      route: '/reproduccion/celo/reportes/general',
    },
    {
      title: 'Reporte de celo por vacuno',
      description:
        'Tabla de registros de celo por vaca. Se mostrará un listado de todas las vacas para que puedas seleccionar una en específico.',
      icon: 'fa-solid fa-table-list',
      route: '/reproduccion/celo/reportes/por-vacuno',
    },
    {
      title: 'Comparación de celos real vs estándar',
      description:
        'Gráfico de los registros de celo realizados diariamente, filtrado por el rango de fechas seleccionado.',
      icon: 'fa-solid fa-chart-line',
      route: '/reproduccion/celo/reportes/comparacion',
    },
    {
      title: 'Comparación de celos real vs estándar por vacuno',
      description:
        'Gráfico de los registros de celo realizados a una vaca en específico.',
      icon: 'fa-solid fa-chart-line',
      route: '/reproduccion/celo/reportes/comparacion-por-vacuno',
    },
  ];

  readonly filteredReports = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.allReports;
    return this.allReports.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term),
    );
  });

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onRangeChange(range: DateRange): void {
    this.dateRange.set(range);
  }
}
