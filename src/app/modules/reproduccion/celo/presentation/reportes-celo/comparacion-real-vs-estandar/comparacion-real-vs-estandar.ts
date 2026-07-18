import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import Chart from 'chart.js/auto';
import type { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button.component';
import { BackLinkComponent } from '@shared/components/back-link/back-link.component';
import { DateRange } from '@shared/models/report-config.model';

import { CeloApiService } from '../../../infrastructure/celo-api.service';
import { ComparacionRealVsEstandar } from '../../../domain/models/celo.model';

@Component({
  selector: 'zt-comparacion-real-vs-estandar',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    PageHeaderComponent,
    DateRangeFilterComponent,
    TranslatePipe,
    IconButtonComponent,
    DownloadButtonComponent,
    BackLinkComponent,
  ],
  templateUrl: './comparacion-real-vs-estandar.html',
  styleUrl: './comparacion-real-vs-estandar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparacionRealVsEstandarComponent implements OnInit {

  private readonly api = inject(CeloApiService);
  private readonly translate = inject(TranslateService);

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
        label: this.translate.instant('reproduccion.celo.reportes.realVsStandard.chart.realDataset'),
        data: [],
        tension: 0.4,
      },
      {
        label: this.translate.instant('reproduccion.celo.reportes.realVsStandard.chart.standardDataset'),
        data: [],
        tension: 0.4,
      },
    ],
  });

  readonly lineChartOptions = signal<ChartConfiguration<'line'>['options']>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: '',
      },
    },
  });

  ngOnInit(): void {
    this.translate
      .stream('reproduccion.celo.reportes.realVsStandard.chart.title')
      .subscribe((text: string) => {
        this.lineChartOptions.update(opts => ({
          ...opts,
          plugins: {
            ...opts?.plugins,
            title: { display: true, text },
          },
        }));
        this.chart?.update();
      });

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
              label: this.translate.instant('reproduccion.celo.reportes.realVsStandard.chart.realDataset'),
              data: response.map(x => Number(x.registrosReales)),
              tension: 0.4,
            },
            {
              label: this.translate.instant('reproduccion.celo.reportes.realVsStandard.chart.standardDataset'),
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
