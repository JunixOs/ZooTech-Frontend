import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  ViewChild,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TriajeService } from '@modules/sanidad/services/triaje.service';
import { TriajeHistorialItem } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { DateRange } from '@shared/models/report-config.model';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, TooltipItem } from 'chart.js';

import { DatePipe } from '@angular/common';

@Component({
  selector: 'zt-reporte-chart-vacuno',
  standalone: true,
  imports: [BaseChartDirective, DatePipe],
  templateUrl: './reporte-chart-vacuno.html',
  styleUrl: './reporte-chart-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteChartVacuno implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly triajeService = inject(TriajeService);

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  vacunoId = signal<number>(0);
  loading = signal<boolean>(false);
  historial = signal<TriajeHistorialItem[]>([]);

  chartType: 'line' = 'line';
  
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll render custom HTML legend
      },
      tooltip: {
        backgroundColor: '#e6f2e6', // light green background
        titleColor: '#6b7280',
        bodyColor: '#6b7280',
        borderColor: '#cce1cc',
        borderWidth: 1,
        displayColors: false,
        padding: 12,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            return `Peso registrado: ${context.parsed.y}, ${context.label}`;
          },
          title: () => '', // hide default title
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fechas',
          color: '#6b7280',
          align: 'end'
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 90,
          minRotation: 90
        }
      },
      y: {
        title: {
          display: true,
          text: 'Peso (Kg)',
          color: '#8a2542',
          align: 'end'
        },
        beginAtZero: true,
        border: {
          color: '#8a2542'
        },
        grid: {
          display: false
        }
      }
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const items = [...this.historial()].reverse();
    return {
      labels: items.map(t => new Date(t.fechaHora).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })),
      datasets: [
        {
          data: items.map(t => t.pesoKg),
          label: 'Peso (Kg)',
          fill: false,
          tension: 0,
          borderColor: '#006400', // Dark green line
          backgroundColor: '#006400',
          pointBackgroundColor: '#006400',
        },
      ],
    };
  });

  fixedDateRange = signal<{desde?: string, hasta?: string}>({});

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('vacunoId');
    if (id) {
      this.vacunoId.set(Number(id));
      this.route.queryParams.subscribe(params => {
        this.fixedDateRange.set({
          desde: params['desde'],
          hasta: params['hasta']
        });
        this.loadData(params['desde'], params['hasta']);
      });
    }
  }

  loadData(desde?: string, hasta?: string): void {
    this.loading.set(true);
    this.triajeService.getHistorialByVacunoId(this.vacunoId(), desde, hasta).subscribe({
      next: (data) => {
        this.historial.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/sanidad/reportes/listado-vacuno'], {
      queryParamsHandling: 'preserve'
    });
  }

  onDownload(): void {
    if (this.chart && this.chart.chart) {
      const url = this.chart.chart.toBase64Image();
      const link = document.createElement('a');
      link.download = `grafico_triaje_vacuno_${this.vacunoId()}.png`;
      link.href = url;
      link.click();
    }
  }
}

