import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  VacunoActivityPoint,
  VacunoService,
} from '../../application/vacuno.service';
import {
  downloadActivityExcel,
  downloadActivityPdf,
} from '../../infrastructure/report-downloads';

interface ChartPoint extends VacunoActivityPoint {
  x: number;
  y: number;
}

interface TooltipData extends ChartPoint {
  label: string;
}

@Component({
  selector: 'zt-vacunos-activity-chart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vacunos-activity-chart.html',
  styleUrl: './vacunos-activity-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosActivityChart {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vacunoService = inject(VacunoService);
  private readonly defaultRange = this.vacunoService.getDefaultActivityRange();
  private readonly chartWidth = 760;
  private readonly chartHeight = 330;
  private readonly plot = {
    left: 58,
    right: 24,
    top: 28,
    bottom: 78,
  };

  readonly fechaInicio = signal(
    this.route.snapshot.queryParamMap.get('fechaInicio') ?? this.defaultRange.fechaInicio,
  );
  readonly fechaFin = signal(
    this.route.snapshot.queryParamMap.get('fechaFin') ?? this.defaultRange.fechaFin,
  );
  readonly downloadOpen = signal(false);
  readonly tooltip = signal<TooltipData | null>(null);
  readonly yTicks = Array.from({ length: 19 }, (_, index) => 19 - index);

  readonly series = computed(() =>
    this.vacunoService.getActivitySeries(this.fechaInicio(), this.fechaFin()),
  );
  readonly mayor = computed(() => Math.max(...this.series().map((point) => point.cantidad)));
  readonly menor = computed(() => Math.min(...this.series().map((point) => point.cantidad)));
  readonly chartPoints = computed<ChartPoint[]>(() => {
    const series = this.series();
    const innerWidth = this.chartWidth - this.plot.left - this.plot.right;
    const innerHeight = this.chartHeight - this.plot.top - this.plot.bottom;
    const lastIndex = Math.max(1, series.length - 1);

    return series.map((point, index) => ({
      ...point,
      x: this.plot.left + (innerWidth * index) / lastIndex,
      y: this.plot.top + ((19 - point.cantidad) / 18) * innerHeight,
    }));
  });
  readonly linePath = computed(() =>
    this.chartPoints()
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' '),
  );
  readonly xLabels = computed(() =>
    this.chartPoints().filter((_, index) => index % Math.max(1, Math.ceil(this.series().length / 18)) === 0),
  );

  formatDate(value: string): string {
    return this.vacunoService.formatDate(value);
  }

  showTooltip(point: ChartPoint): void {
    this.tooltip.set({
      ...point,
      label: `Vacunos en actividad: ${point.cantidad}, ${this.formatDate(point.fecha)}`,
    });
  }

  hideTooltip(): void {
    this.tooltip.set(null);
  }

  toggleDownload(): void {
    this.downloadOpen.set(!this.downloadOpen());
  }

  download(format: 'excel' | 'pdf'): void {
    const metadata = {
      fechaInicio: this.formatDate(this.fechaInicio()),
      fechaFin: this.formatDate(this.fechaFin()),
      mayor: this.mayor(),
      menor: this.menor(),
    };

    if (format === 'excel') {
      downloadActivityExcel(this.series(), metadata);
    } else {
      downloadActivityPdf(this.series(), metadata);
    }

    this.downloadOpen.set(false);
    void this.router.navigate(['/vacuno/reportes'], { queryParams: { descarga: 'exitosa' } });
  }
}
