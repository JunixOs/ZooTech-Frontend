import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRange } from '@shared/models/report-config.model';
import { ReportesSanidadFacade } from '../../application/reportes-sanidad.facade';

@Component({
  selector: 'zt-reporte-dashboard',
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './reporte-dashboard.html',
  styleUrl: './reporte-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteDashboard {
  private readonly facade = inject(ReportesSanidadFacade);

  readonly dateRange = input<DateRange>();
  readonly volver = output<void>();

  readonly resumen = this.facade.resumen;
  readonly loading = this.facade.loading;

  hasSelectedDates = computed(() => {
    const range = this.dateRange();
    return !!(range && range.start && range.end);
  });

  constructor() {
    effect(() => {
      const range = this.dateRange();
      if (range?.start && range?.end) {
        this.facade.cargarResumen(this.toISODate(range.start), this.toISODate(range.end));
      }
    });
  }

  private toISODate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  goBack(): void {
    this.volver.emit();
  }
}
