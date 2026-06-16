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
  afterNextRender,
    OnDestroy,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRange } from '@shared/models/report-config.model';
import { ReportesSanidadFacade } from '../../application/reportes-sanidad.facade';
import * as echarts from 'echarts';

@Component({
  selector: 'zt-reporte-peso-promedio',
  imports: [TranslatePipe],
  templateUrl: './reporte-peso-promedio.html',
  styleUrl: './reporte-peso-promedio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportePesoPromedio implements OnDestroy {
  private readonly facade = inject(ReportesSanidadFacade);

  readonly dateRange = input<DateRange>();
  readonly volver = output<void>();
  readonly downloadComplete = output<void>();

  readonly chartContainer = viewChild.required<ElementRef<HTMLDivElement>>('chartContainer');
  readonly data = this.facade.pesoPromedio;
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

  constructor() {
    afterNextRender(() => {
      this.chart = echarts.init(this.chartContainer().nativeElement, undefined, { renderer: 'svg' });

      effect(() => {
        const items = this.data();
        if (this.chart && items.length > 0) {
          this.chart.setOption({
            tooltip: {
              trigger: 'axis',
              formatter: (params: { value: number; axisValue: string }[]) => {
                const p = params[0];
                return `${p.axisValue}<br/>Peso promedio: <b>${p.value} kg</b>`;
              },
            },
            grid: { left: 60, right: 30, top: 40, bottom: 60 },
            xAxis: {
              type: 'category',
              data: items.map((i) => {
                const d = new Date(i.fecha);
                return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
              }),
              axisLabel: { rotate: 45, fontSize: 11 },
            },
            yAxis: {
              type: 'value',
              name: 'Peso (kg)',
              nameTextStyle: { fontSize: 11 },
              min: (value: { min: number }) => Math.max(0, Math.floor((value.min - 5) / 5) * 5),
            },
            series: [
              {
                type: 'line',
                data: items.map((i) => i.pesoPromedio),
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { color: '#137333', width: 2 },
                itemStyle: { color: '#137333' },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(19, 115, 51, 0.25)' },
                    { offset: 1, color: 'rgba(19, 115, 51, 0)' },
                  ]),
                },
              },
            ],
          });
        } else if (this.chart) {
          this.chart.clear();
        }
      });
    });

    effect(() => {
      const range = this.dateRange();
      if (range?.start && range?.end) {
        this.facade.cargarPesoPromedio(
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
    const headers = ['Fecha', 'Peso Promedio (Kg)', 'Cantidad Registros'];
    const rows = items.map((i) => {
      const d = new Date(i.fecha);
      return [d.toLocaleDateString(), i.pesoPromedio.toString(), i.cantidadRegistros.toString()];
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `Peso_Promedio_${new Date().toISOString().split('T')[0]}.csv`);
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
