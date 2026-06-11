import { ChangeDetectionStrategy, Component, computed, effect, HostListener, inject, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { DateRange } from '@shared/models/report-config.model';
import { Triaje } from '../../../../triaje/domain/models/triaje.model';
import { TriajeService } from '../../../../services/triaje.service';

interface ChartPoint {
  x: number;
  y: number;
  val: number;
  fecha: string;
  vacuno: string;
  codigo: string;
}

@Component({
  selector: 'zt-reporte-chart-general',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './reporte-chart-general.html',
  styleUrl: './reporte-chart-general.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteChartGeneral {
  private triajeService = inject(TriajeService);

  dateRange = input<DateRange>();
  volver = output<void>();
  downloadComplete = output<void>();

  triajes = signal<Triaje[]>([]);
  loading = signal(false);
  isDropdownOpen = signal(false);
  activePoint = signal<ChartPoint | null>(null);

  hasSelectedDates = computed(() => {
    const range = this.dateRange();
    return !!(range && range.start && range.end);
  });

  paddingLeft = 60;
  paddingRight = 60;
  paddingTop = 60;
  paddingBottom = 80;
  chartHeight = 350;

  constructor() {
    effect(() => {
      const range = this.dateRange();
      this.loadData(range);
    });
  }

  loadData(range: DateRange | undefined) {
    if (!range || !range.start || !range.end) {
      this.triajes.set([]);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    const startStr = this.toISODate(range.start);
    const endStr = this.toISODate(range.end);

    this.triajeService.getGeneralReport(startStr, endStr).subscribe({
      next: (data) => {
        this.triajes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching general triage data:', err);
        this.loading.set(false);
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
    const data = this.triajes();
    return Math.max(750, data.length * 40 + this.paddingLeft + this.paddingRight);
  });

  chartPoints = computed<ChartPoint[]>(() => {
    const data = this.triajes();
    if (data.length === 0) return [];

    const weights = data.map(d => d.pesoKg);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    // Round bounds to nice multiples of 5
    const min = Math.max(0, Math.floor((minWeight - 5) / 5) * 5);
    const max = Math.ceil((maxWeight + 5) / 5) * 5;
    const yRange = max - min || 1;

    const width = this.chartWidth();
    const drawableWidth = width - this.paddingLeft - this.paddingRight;
    const drawableHeight = this.chartHeight - this.paddingTop - this.paddingBottom;

    return data.map((item, i) => {
      const x = this.paddingLeft + (data.length > 1 
        ? (i * drawableWidth) / (data.length - 1)
        : drawableWidth / 2);

      const y = this.paddingTop + drawableHeight - ((item.pesoKg - min) / yRange) * drawableHeight;

      const date = new Date(item.fechaHora);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const dateStr = `${day}/${month}/${year}`;

      return {
        x,
        y,
        val: item.pesoKg,
        fecha: dateStr,
        vacuno: item.vacunoNombre || 'Vacuno',
        codigo: item.codigo
      };
    });
  });

  linePath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  });

  areaPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    const firstX = pts[0].x;
    const lastX = pts[pts.length - 1].x;
    const bottomY = this.chartHeight - this.paddingBottom;
    return (
      `M ${firstX} ${bottomY} L ${firstX} ${pts[0].y} ` +
      pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') +
      ` L ${lastX} ${bottomY} Z`
    );
  });

  yTicks = computed(() => {
    const data = this.triajes();
    if (data.length === 0) return [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];

    const weights = data.map(d => d.pesoKg);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    const min = Math.max(0, Math.floor((minWeight - 5) / 5) * 5);
    const max = Math.ceil((maxWeight + 5) / 5) * 5;
    
    const ticks = [];
    // Generate tick marks in increments of 5
    for (let val = min; val <= max; val += 5) {
      ticks.push(val);
    }

    if (ticks.length < 2) {
      ticks.push(min + 5);
    }
    
    return ticks;
  });

  getYCoordinate(val: number): number {
    const data = this.triajes();
    if (data.length === 0) return 0;
    const weights = data.map(d => d.pesoKg);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    const min = Math.max(0, Math.floor((minWeight - 5) / 5) * 5);
    const max = Math.ceil((maxWeight + 5) / 5) * 5;
    const yRange = max - min || 1;
    const drawableHeight = this.chartHeight - this.paddingTop - this.paddingBottom;

    return this.paddingTop + drawableHeight - ((val - min) / yRange) * drawableHeight;
  }

  getDateRangeLabel = computed(() => {
    const range = this.dateRange();
    if (range && range.start && range.end) {
      const formatDateStr = (d: Date): string => {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };
      return `Desde: ${formatDateStr(range.start)}   Hasta: ${formatDateStr(range.end)}`;
    }
    return 'Sin rango seleccionado';
  });

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.download-dropdown')) {
      this.isDropdownOpen.set(false);
    }
  }

  hoverPoint(pt: ChartPoint) {
    this.activePoint.set(pt);
  }

  clearHover() {
    this.activePoint.set(null);
  }

  downloadExcel(): void {
    const data = this.triajes();
    if (data.length === 0) return;

    const headers = ['Código', 'Fecha', 'Hora', 'Nombre Vacuno', 'Tipo de Peso', 'Peso (Kg)', 'Observaciones'];
    const rows = data.map(item => {
      const date = new Date(item.fechaHora);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return [
        item.codigo,
        dateStr,
        timeStr,
        item.vacunoNombre || '',
        item.tipoPesoCode,
        item.pesoKg.toString(),
        item.observaciones || ''
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Named with .csv to open directly in Excel
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Triajes_General_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.isDropdownOpen.set(false);
    this.downloadComplete.emit();
  }

  downloadPdf(): void {
    const data = this.triajes();
    if (data.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateRangeStr = this.getDateRangeLabel();
    const rowsHtml = data.map(item => {
      const date = new Date(item.fechaHora);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <tr>
          <td>${item.codigo}</td>
          <td>${dateStr}</td>
          <td>${timeStr}</td>
          <td>${item.vacunoNombre || ''}</td>
          <td>${item.tipoPesoCode}</td>
          <td style="text-align: right;">${item.pesoKg.toFixed(3)} Kg</td>
        </tr>
      `;
    }).join('');

    const svgElement = document.querySelector('.chart-scroll-container svg');
    const svgHtml = svgElement ? svgElement.outerHTML : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Triajes en General</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; padding: 20px; }
            h1 { color: #800020; margin-bottom: 5px; font-size: 24px; text-transform: uppercase; letter-spacing: 0.05em; }
            .subtitle { color: #666; font-size: 14px; margin-bottom: 25px; }
            .chart-container { margin: 20px 0; overflow-x: auto; }
            svg { border: 1px solid #ddd; border-radius: 4px; background-color: #fafafa; width: 100%; height: auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
            th { background-color: #800020; color: white; font-weight: 600; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .grid-line { stroke: #e2e8f0; stroke-width: 1; stroke-dasharray: 2; }
            .chart-line-bg { fill: url(#chart-gradient); }
            .chart-line { fill: none; stroke: #137333; stroke-width: 3; }
            .chart-dot { fill: #137333; stroke: #fff; stroke-width: 2; }
            .axis-title-y, .axis-title-x { font-size: 10px; fill: #666; font-weight: bold; }
            .y-label { font-size: 9px; fill: #666; }
            .x-label-rotated { font-size: 9px; fill: #666; }
            .legend { display: flex; align-items: center; margin-top: 15px; font-size: 12px; font-weight: 500; }
            .legend-color { width: 30px; height: 4px; background-color: #137333; margin-right: 10px; border-radius: 2px; }
          </style>
        </head>
        <body>
          <h1>TRIAJES EN GENERAL</h1>
          <div class="subtitle">Rango de fechas: ${dateRangeStr}</div>
          
          <div class="chart-container">
            ${svgHtml}
          </div>
          
          <div class="legend">
            <div class="legend-color"></div>
            <span>Peso (Kg)</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Nombre Vacuno</th>
                <th>Tipo de Peso</th>
                <th>Peso</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    this.isDropdownOpen.set(false);
    this.downloadComplete.emit();
  }

  goBack() {
    this.volver.emit();
  }
}
