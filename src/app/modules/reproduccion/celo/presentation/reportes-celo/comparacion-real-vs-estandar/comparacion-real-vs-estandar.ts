import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import Chart from 'chart.js/auto';
import type { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DateRange } from '@shared/models/report-config.model';

import { CeloApiService } from '../../../infrastructure/celo-api.service';
import { ComparacionRealVsEstandar } from '../../../domain/models/celo.model';

@Component({
  selector: 'zt-comparacion-real-vs-estandar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BaseChartDirective,
    PageHeaderComponent,
    DateRangeFilterComponent,
  ],
  templateUrl: './comparacion-real-vs-estandar.html',
  styleUrl: './comparacion-real-vs-estandar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparacionRealVsEstandarComponent implements OnInit {

  private readonly api = inject(CeloApiService);

  @ViewChild(BaseChartDirective)
  chart?: BaseChartDirective;

  readonly cargando = signal(false);
  readonly datos = signal<ComparacionRealVsEstandar[]>([]);

  private readonly dateRange = signal<DateRange>({
    start: null,
    end: null,
  });

  private readonly tempDateRange = signal<DateRange>({
    start: null,
    end: null,
  });

  readonly lineChartData = signal<ChartConfiguration<'line'>['data']>({
    labels: [],
    datasets: [
      {
        label: 'Registros Reales',
        data: [],
        tension: 0.4,
      },
      {
        label: 'Registros Estándar',
        data: [],
        tension: 0.4,
      },
    ],
  });

  readonly lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Comparación de Celos Real vs Estándar',
      },
    },
  };

  ngOnInit(): void {
    this.obtenerDatos();
  }

  onDateRangeChange(range: DateRange): void {
    this.tempDateRange.set(range);

    if (range.start === null && range.end === null) {
      this.dateRange.set(range);
      this.obtenerDatos();
    }
  }

  onApplyFilters(): void {
    this.dateRange.set(this.tempDateRange());
    this.obtenerDatos();
  }

  descargarGrafico(): void {
    if (!this.chart?.chart) return;

    const link = document.createElement('a');
    link.download = 'comparacion-real-vs-estandar.png';
    link.href = this.chart.chart.toBase64Image();
    link.click();
  }

  obtenerDatos(): void {

    this.cargando.set(true);

    const inicio = this.formatDate(this.dateRange().start);
    const fin = this.formatDate(this.dateRange().end);

    this.api.listarComparacionRealVsEstandar(inicio, fin).subscribe({

      next: (response) => {

        this.datos.set(response);

        this.lineChartData.set({
          labels: response.map(x => x.fecha),
          datasets: [
            {
              label: 'Registros Reales',
              data: response.map(x => Number(x.registrosReales)),
              tension: 0.4,
            },
            {
              label: 'Registros Estándar',
              data: response.map(x => Number(x.registrosEstandar)),
              tension: 0.4,
            },
          ],
        });

        setTimeout(() => {
          this.chart?.update();
        });

        this.cargando.set(false);

      },

      error: err => {

        console.error(err);

        this.cargando.set(false);

      },

    });

  }

  private formatDate(date: Date | null): string | undefined {

    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

}
