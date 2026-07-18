import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import type { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button.component';
import { BackLinkComponent } from '@shared/components/back-link/back-link.component';
import { DateRange } from '@shared/models/report-config.model';

import { CeloApiService } from '../../../infrastructure/celo-api.service';
import { ComparacionCelosPorVacuno } from '../../../domain/models/reporte-celo-vacuno.model';
import { formatDateParam } from '@shared/utils/date-format.util';

@Component({
  selector: 'zt-comparacion-por-vacuno-detalle',
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
  templateUrl: './comparacion-por-vacuno-detalle.component.html',
  styleUrl: './comparacion-por-vacuno-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparacionPorVacunoDetalleComponent implements OnInit {
  private readonly api = inject(CeloApiService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);

  @ViewChild(BaseChartDirective)
  chart?: BaseChartDirective;

  readonly codigoVacuno = signal('');
  readonly nombreVacuno = signal('');

  readonly tituloPantalla = computed(() => {
    const codigo = this.codigoVacuno();
    const nombre = this.nombreVacuno();

    if (!codigo && !nombre) {
      return 'reproduccion.celo.reportes.realVsStandardByCattle.detail.title';
    }

    if (!nombre) {
      return codigo;
    }

    return `${codigo} - ${nombre}`.toUpperCase();
  });

  readonly cargando = signal(false);
  readonly datos = signal<ComparacionCelosPorVacuno[]>([]);

  readonly totalRegistros = computed(() =>
    this.datos().reduce((sum, item) => sum + item.registrosReales, 0),
  );

  private readonly dateRange = signal<DateRange>({ start: null, end: null });
  private readonly tempDateRange = signal<DateRange>({ start: null, end: null });

  readonly rangoDesde = computed(() => {
    const explicito = this.dateRange().start;
    if (explicito) return this.formatDateDisplay(explicito);

    const primero = this.datos()[0]?.periodo;
    return primero ? this.formatDateDisplay(new Date(primero)) : null;
  });

  readonly rangoHasta = computed(() => {
    const explicito = this.dateRange().end;
    if (explicito) return this.formatDateDisplay(explicito);

    const datos = this.datos();
    const ultimo = datos[datos.length - 1]?.periodo;
    if (!ultimo) return null;

    const fecha = new Date(ultimo);
    const finDeMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    return this.formatDateDisplay(finDeMes);
  });

  private static readonly REAL_COLOR = '#802b4d';
  private static readonly IDEAL_COLOR = '#2e7d32';

  readonly lineChartData = signal<ChartConfiguration<'line'>['data']>({
    labels: [],
    datasets: [
      {
        label: this.translate.instant('reproduccion.celo.reportes.realVsStandardByCattle.detail.chart.realDataset'),
        data: [],
        tension: 0.3,
        borderColor: ComparacionPorVacunoDetalleComponent.REAL_COLOR,
        backgroundColor: ComparacionPorVacunoDetalleComponent.REAL_COLOR,
        pointBackgroundColor: ComparacionPorVacunoDetalleComponent.REAL_COLOR,
      },
      {
        label: this.translate.instant('reproduccion.celo.reportes.realVsStandardByCattle.detail.chart.idealDataset'),
        data: [],
        tension: 0.3,
        borderColor: ComparacionPorVacunoDetalleComponent.IDEAL_COLOR,
        backgroundColor: ComparacionPorVacunoDetalleComponent.IDEAL_COLOR,
        pointBackgroundColor: ComparacionPorVacunoDetalleComponent.IDEAL_COLOR,
      },
    ],
  });

  readonly lineChartOptions = signal<ChartConfiguration<'line'>['options']>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: this.translate.instant('reproduccion.celo.reportes.realVsStandardByCattle.detail.chart.yAxis'),
          color: ComparacionPorVacunoDetalleComponent.REAL_COLOR,
        },
        ticks: {
          precision: 0,
          callback: (value) => String(value).padStart(2, '0'),
        },
      },
      x: {
        title: {
          display: true,
          text: this.translate.instant('reproduccion.celo.reportes.realVsStandardByCattle.detail.chart.xAxis'),
          color: ComparacionPorVacunoDetalleComponent.REAL_COLOR,
          align: 'end',
        },
      },
    },
  });

  ngOnInit(): void {
    const codigoVacuno = this.route.snapshot.paramMap.get('codigoVacuno') ?? '';
    const nombreVacuno = this.route.snapshot.queryParamMap.get('nombre') ?? '';

    this.codigoVacuno.set(codigoVacuno);
    this.nombreVacuno.set(nombreVacuno);

    this.translate
      .stream('reproduccion.celo.reportes.realVsStandardByCattle.detail.chart.title')
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

    if (codigoVacuno) {
      this.obtenerDatos();
    }
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
    link.download = `comparacion-por-vacuno-${this.codigoVacuno()}.png`;
    link.href = this.chart.chart.toBase64Image();
    link.click();
  }

  obtenerDatos(): void {
    this.cargando.set(true);

    const inicio = formatDateParam(this.dateRange().start);
    const fin = formatDateParam(this.dateRange().end);

    this.api.obtenerComparacionPorVacuno(this.codigoVacuno(), inicio, fin).subscribe({
      next: (response) => {
        this.datos.set(response);

        this.lineChartData.set({
          labels: response.map(x => this.formatPeriodoLabel(x.periodo)),
          datasets: [
            {
              label: this.translate.instant('reproduccion.celo.reportes.realVsStandardByCattle.detail.chart.realDataset'),
              data: response.map(x => Number(x.registrosReales)),
              tension: 0.3,
              borderColor: ComparacionPorVacunoDetalleComponent.REAL_COLOR,
              backgroundColor: ComparacionPorVacunoDetalleComponent.REAL_COLOR,
              pointBackgroundColor: ComparacionPorVacunoDetalleComponent.REAL_COLOR,
            },
            {
              label: this.translate.instant('reproduccion.celo.reportes.realVsStandardByCattle.detail.chart.idealDataset'),
              data: response.map(x => Number(x.registrosEstandar)),
              tension: 0.3,
              borderColor: ComparacionPorVacunoDetalleComponent.IDEAL_COLOR,
              backgroundColor: ComparacionPorVacunoDetalleComponent.IDEAL_COLOR,
              pointBackgroundColor: ComparacionPorVacunoDetalleComponent.IDEAL_COLOR,
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

  private formatPeriodoLabel(periodo: string): string[] {
    const fecha = new Date(periodo);
    const year = fecha.getFullYear();
    const mes = new Intl.DateTimeFormat(this.translate.currentLang || 'es', { month: 'long' })
      .format(fecha);

    return [`${year}-`, mes.charAt(0).toUpperCase() + mes.slice(1)];
  }

  private formatDateDisplay(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
