import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ReportConfig, DateRange } from '@shared/models/report-config.model';
import { ReportGridComponent } from '@shared/components/report-grid/report-grid.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';

@Component({
  selector: 'zt-report-layout',
  standalone: true,
  imports: [ReportGridComponent, SearchInputComponent, DateRangeFilterComponent, TranslatePipe],
  templateUrl: './report-layout.component.html',
  styleUrl: './report-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportLayoutComponent {
  /** Título de la sección (ej: 'Reportes de Sanidad') */
  title = input<string>();
  /** Lista de reportes a mostrar en el grid */
  reports = input.required<ReportConfig[]>();
  /** Estado de carga del grid */
  loading = input(false);

  /** Emite cuando el usuario cambia el rango de fechas */
  rangeChange = output<DateRange>();
  /** Emite cuando el usuario realiza una búsqueda */
  search = output<string>();
}
