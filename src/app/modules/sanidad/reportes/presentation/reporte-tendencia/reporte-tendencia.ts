import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRange } from '@shared/models/report-config.model';
import { TriajeService } from '@modules/sanidad/services/triaje.service';
import {
  TriajeVacunoOption,
  TriajeHistorialItem,
} from '@modules/sanidad/triaje/domain/models/triaje.model';
import * as echarts from 'echarts';

@Component({
  selector: 'zt-reporte-tendencia',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './reporte-tendencia.html',
  styleUrl: './reporte-tendencia.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteTendencia implements OnDestroy {
  private readonly triajeService = inject(TriajeService);

  readonly dateRange = input<DateRange>();
  readonly volver = output<void>();
  readonly downloadComplete = output<void>();

  readonly chartContainer = viewChild.required<ElementRef<HTMLDivElement>>('chartContainer');
  private chart: echarts.ECharts | null = null;

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

  vacunosList = signal<TriajeVacunoOption[]>([]);
  selectedVacunoIds = signal<number[]>([]);
  historialMap = signal<Map<number, TriajeHistorialItem[]>>(new Map());
  loading = signal(false);
  isDropdownOpen = signal(false);

  colors = ['#800020', '#137333', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];

  constructor() {
    this.triajeService.getVacunos().subscribe((data) => this.vacunosList.set(data));

    effect(() => {
      const ids = this.selectedVacunoIds();
      const range = this.dateRange();
      if (ids.length > 0) {
        this.loading.set(true);
        const start = range?.start ? this.toISODate(range.start) : undefined;
        const end = range?.end ? this.toISODate(range.end) : undefined;
        const map = new Map<number, TriajeHistorialItem[]>();
        let completed = 0;
        ids.forEach((id) => {
          this.triajeService.getHistorialByVacunoId(id, start, end).subscribe({
            next: (data) => {
              map.set(id, data);
              completed++;
              if (completed === ids.length) {
                this.historialMap.set(map);
                this.loading.set(false);
                this.updateChart();
              }
            },
            error: () => {
              map.set(id, []);
              completed++;
              if (completed === ids.length) {
                this.historialMap.set(map);
                this.loading.set(false);
                this.updateChart();
              }
            },
          });
        });
      } else {
        this.historialMap.set(new Map());
      }
    });
  }

  private toISODate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toggleVacuno(id: number): void {
    this.selectedVacunoIds.update((ids) =>
      ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]
    );
  }

  private updateChart(): void {
    if (!this.chart) {
      this.chart = echarts.init(this.chartContainer().nativeElement, undefined, { renderer: 'svg' });
    }

    const map = this.historialMap();
    if (map.size === 0) {
      this.chart.clear();
      return;
    }

    const allDates = new Set<string>();
    const series: echarts.SeriesOption[] = [];
    let seriesIndex = 0;

    map.forEach((items, vacunoId) => {
      const vacuno = this.vacunosList().find((v) => v.id === vacunoId);
      const sorted = [...items].sort(
        (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
      );

      sorted.forEach((item) => {
        const d = new Date(item.fechaHora);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        allDates.add(key);
      });

      series.push({
        name: vacuno?.nombre ?? `Vacuno #${vacunoId}`,
        type: 'line',
        data: sorted.map((item) => {
          const d = new Date(item.fechaHora);
          return [
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            item.pesoKg,
          ];
        }),
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2 },
        itemStyle: { color: this.colors[seriesIndex % this.colors.length] },
        emphasis: { focus: 'series' },
      });
      seriesIndex++;
    });

    this.chart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: { seriesName: string; value: number[]; marker: string }[]) => {
          return params
            .map(
              (p) =>
                `${p.marker} ${p.seriesName}: <b>${(p.value[1] as number).toFixed(2)} kg</b>`
            )
            .join('<br/>');
        },
      },
      legend: {
        type: 'scroll',
        top: 0,
        textStyle: { fontSize: 12 },
      },
      grid: { left: 60, right: 30, top: 60, bottom: 60 },
      xAxis: {
        type: 'time',
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: 'Peso (kg)',
        nameTextStyle: { fontSize: 11 },
      },
      series,
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((v) => !v);
  }

  downloadCsv(): void {
    const map = this.historialMap();
    if (map.size === 0) return;
    const headers = ['Vacuno', 'Fecha', 'Peso (Kg)', 'Tipo Peso'];
    const rows: string[][] = [];
    map.forEach((items, vacunoId) => {
      const vacuno = this.vacunosList().find((v) => v.id === vacunoId);
      items.forEach((item) => {
        const d = new Date(item.fechaHora);
        rows.push([
          vacuno?.nombre ?? `#${vacunoId}`,
          d.toLocaleDateString(),
          item.pesoKg.toString(),
          item.tipoPesoCode,
        ]);
      });
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `Tendencia_Peso_${new Date().toISOString().split('T')[0]}.csv`);
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
