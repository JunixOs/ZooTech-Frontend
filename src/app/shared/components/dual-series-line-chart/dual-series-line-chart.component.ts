import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

/** Generic point shape rendered by the chart: a "real" value plus a second comparison series. */
export interface DualSeriesChartPoint {
  real: number;
  second: number;
}

/** A single x-axis label placed at a computed pixel position. */
export interface DualSeriesXLabel {
  x: number;
  label: string;
}

/**
 * Presentational dual-series SVG line chart (real production vs. a second comparison series,
 * e.g. prediction or standard production). All chart math (scales, ticks, polylines, totals) is
 * computed upstream via `createChartState`/`toChartPoints` in `leche-report.utils.ts` — this
 * component only renders the already-computed values, so it stays framework-agnostic of any
 * particular report's domain model.
 */
@Component({
  selector: 'zt-dual-series-line-chart',
  standalone: true,
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './dual-series-line-chart.component.html',
  styleUrl: './dual-series-line-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DualSeriesLineChartComponent {
  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly datos = input.required<DualSeriesChartPoint[]>();

  readonly chartW = input.required<number>();
  readonly chartH = input.required<number>();
  readonly yTicks = input.required<number[]>();
  readonly xLabels = input.required<DualSeriesXLabel[]>();
  readonly scaleX = input.required<(i: number) => number>();
  readonly scaleY = input.required<(v: number) => number>();

  readonly polylineReal = input.required<string>();
  readonly areaReal = input.required<string>();
  readonly totalReal = input.required<number>();

  readonly polylineSecond = input.required<string>();
  readonly areaSecond = input.required<string>();
  readonly totalSecond = input.required<number>();

  /** Second-series color, e.g. '#2563eb' (prediction) or '#6b21a8' (standard production). */
  readonly secondColor = input.required<string>();
  /** i18n key for the second-series legend label. */
  readonly secondLegendKey = input.required<string>();
  /** i18n key for the second-series total label. */
  readonly secondTotalKey = input.required<string>();

  readonly svgDims = { width: 800, height: 360 };
  readonly padding = { top: 30, right: 40, bottom: 120, left: 70 };
}
