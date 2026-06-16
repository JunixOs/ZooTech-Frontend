import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { TriajeService } from '@modules/sanidad/services/triaje.service';
import { TriajeVacunoOption, TriajeHistorialItem } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { DateRange } from '@shared/models/report-config.model';

interface ChartPoint {
  x: number;
  y: number;
  val: number;
  fecha: string;
}

@Component({
  selector: 'zt-reporte-chart-vacuno',
  imports: [CommonModule, DecimalPipe, FormsModule, TranslatePipe],
  templateUrl: './reporte-chart-vacuno.html',
  styleUrl: './reporte-chart-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesChartVacuno {
  private readonly triajeService = inject(TriajeService);

  readonly dateRange = input<DateRange>();
  readonly volver = output<void>();
  readonly downloadComplete = output<void>();

  vacunosList = signal<TriajeVacunoOption[]>([]);
  selectedVacunoId = signal<number | null>(null);
  historial = signal<TriajeHistorialItem[]>([]);
  loading = signal(false);
  isDropdownOpen = signal(false);
  activePoint = signal<ChartPoint | null>(null);

  paddingLeft = 60;
  paddingRight = 60;
  paddingTop = 60;
  paddingBottom = 80;
  chartHeight = 350;

  constructor() {
    this.triajeService.getVacunos().subscribe((data) => this.vacunosList.set(data));

    effect(() => {
      const id = this.selectedVacunoId();
      const range = this.dateRange();
      if (id) {
        this.loading.set(true);
        const start = range?.start ? this.toISODate(range.start) : undefined;
        const end = range?.end ? this.toISODate(range.end) : undefined;
        this.triajeService.getHistorialByVacunoId(id, start, end).subscribe({
          next: (data) => {
            this.historial.set(data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      }
    });
  }

  private toISODate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  chartWidth = computed(() => {
    const data = this.historial();
    return Math.max(750, data.length * 40 + this.paddingLeft + this.paddingRight);
  });

  chartPoints = computed<ChartPoint[]>(() => {
    const data = this.historial();
    if (data.length === 0) return [];
    const weights = data.map((d) => d.pesoKg);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const min = Math.max(0, Math.floor((minWeight - 5) / 5) * 5);
    const max = Math.ceil((maxWeight + 5) / 5) * 5;
    const yRange = max - min || 1;
    const width = this.chartWidth();
    const drawableWidth = width - this.paddingLeft - this.paddingRight;
    const drawableHeight = this.chartHeight - this.paddingTop - this.paddingBottom;
    return data.map((item, i) => {
      const x = this.paddingLeft + (data.length > 1 ? (i * drawableWidth) / (data.length - 1) : drawableWidth / 2);
      const y = this.paddingTop + drawableHeight - ((item.pesoKg - min) / yRange) * drawableHeight;
      const date = new Date(item.fechaHora);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return { x, y, val: item.pesoKg, fecha: `${day}/${month}/${year}` };
    });
  });

  linePath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
  });

  areaPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    const firstX = pts[0].x;
    const lastX = pts[pts.length - 1].x;
    const bottomY = this.chartHeight - this.paddingBottom;
    return `M ${firstX} ${bottomY} L ${firstX} ${pts[0].y} ` +
      pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') +
      ` L ${lastX} ${bottomY} Z`;
  });

  yTicks = computed(() => {
    const data = this.historial();
    if (data.length === 0) return [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
    const weights = data.map((d) => d.pesoKg);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const min = Math.max(0, Math.floor((minWeight - 5) / 5) * 5);
    const max = Math.ceil((maxWeight + 5) / 5) * 5;
    const ticks: number[] = [];
    for (let val = min; val <= max; val += 5) {
      ticks.push(val);
    }
    if (ticks.length < 2) ticks.push(min + 5);
    return ticks;
  });

  getYCoordinate(val: number): number {
    const data = this.historial();
    if (data.length === 0) return 0;
    const weights = data.map((d) => d.pesoKg);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const min = Math.max(0, Math.floor((minWeight - 5) / 5) * 5);
    const max = Math.ceil((maxWeight + 5) / 5) * 5;
    const yRange = max - min || 1;
    const drawableHeight = this.chartHeight - this.paddingTop - this.paddingBottom;
    return this.paddingTop + drawableHeight - ((val - min) / yRange) * drawableHeight;
  }

  hoverPoint(pt: ChartPoint): void {
    this.activePoint.set(pt);
  }

  clearHover(): void {
    this.activePoint.set(null);
  }

  goBack(): void {
    this.volver.emit();
  }

  downloadCsv(): void {
    const data = this.historial();
    if (data.length === 0) return;
    const headers = ['Fecha', 'Hora', 'Tipo Peso', 'Peso (Kg)', 'Observaciones'];
    const rows = data.map((item) => {
      const date = new Date(item.fechaHora);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        item.tipoPesoCode,
        item.pesoKg.toString(),
        item.observaciones || '',
      ];
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `Reporte_Triaje_Vacuno_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.isDropdownOpen.set(false);
    this.downloadComplete.emit();
  }
}
