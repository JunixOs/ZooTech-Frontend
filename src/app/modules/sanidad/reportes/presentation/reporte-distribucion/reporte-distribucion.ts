import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  OnDestroy,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRange } from '@shared/models/report-config.model';
import { ReportesSanidadFacade } from '../../application/reportes-sanidad.facade';
import * as echarts from 'echarts';

@Component({
  selector: 'zt-reporte-distribucion',
  imports: [TranslatePipe],
  templateUrl: './reporte-distribucion.html',
  styleUrl: './reporte-distribucion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteDistribucion implements OnDestroy {
  private readonly facade = inject(ReportesSanidadFacade);

  readonly dateRange = input<DateRange>();
  readonly volver = output<void>();
  readonly downloadComplete = output<void>();

  readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  readonly data = this.facade.distribucionTipoPeso;
  readonly loading = this.facade.loading;
  private chart: echarts.ECharts | null = null;

  isDropdownOpen = signal(false);

  hasSelectedDates = computed(() => {
    const range = this.dateRange();
    return !!(range && range.start && range.end);
  });

  getDateRangeLabel = computed(() => {
    const range = this.dateRange();
    if (range && range.start && range.end) {
      const f = (d: Date) =>
        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      return `Desde: ${f(range.start)}   Hasta: ${f(range.end)}`;
    }
    return 'Sin rango seleccionado';
  });

  colors = ['#800020', '#137333', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];

  constructor() {
    effect(() => {
      const el = this.chartContainer()?.nativeElement;
      if (el && !this.chart) {
        this.chart = echarts.init(el, undefined, { renderer: 'svg' });
      }
    });

    effect(() => {
      const items = this.data();
      if (this.chart && items.length > 0) {
        this.chart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
          },
          grid: { left: 60, right: 30, top: 40, bottom: 60 },
          series: [
            {
              type: 'pie',
              radius: ['30%', '70%'],
              center: ['50%', '50%'],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 6,
                borderColor: '#fff',
                borderWidth: 2,
              },
              label: {
                show: true,
                formatter: '{b}\n{d}%',
                fontSize: 12,
              },
              emphasis: {
                label: { show: true, fontSize: 14, fontWeight: 'bold' },
                itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
              },
              data: items.map((item, i) => ({
                name: item.nombre,
                value: item.cantidad,
                itemStyle: { color: this.colors[i % this.colors.length] },
              })),
            },
          ],
        });
      } else if (this.chart) {
        this.chart.clear();
      }
    });

    effect(() => {
      const range = this.dateRange();
      if (range?.start && range?.end) {
        this.facade.cargarDistribucionTipoPeso(
          this.toISODate(range.start),
          this.toISODate(range.end)
        );
      }
    });
  }

  private toISODate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((v) => !v);
  }

  downloadCsv(): void {
    const items = this.data();
    if (items.length === 0) return;
    const headers = ['Tipo de Peso', 'Cantidad'];
    const rows = items.map((i) => [i.nombre, i.cantidad.toString()]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `Distribucion_Tipo_Peso_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    this.isDropdownOpen.set(false);
    this.downloadComplete.emit();
  }

  goBack(): void {
    this.volver.emit();
  }

  ngOnDestroy(): void {
    this.chart?.dispose();
  }
}
