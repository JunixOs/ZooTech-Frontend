import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DateRange } from '@shared/models/report-config.model';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LecheRepository,
  ConsultaFiltros,
} from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheRegistro } from '@modules/leche/domain/models/leche.model';
import {
  toDateStr,
  parseFechaHora,
  openPdfBlob,
  buildPdfFilters,
  createChartState,
  toChartPoints,
  ChartPoint,
} from '../leche-report/leche-report.utils';

interface ChartRow {
  fecha: string;
  label: string;
  real: number;
  estandar: number;
}

@Component({
  selector: 'zt-comparacion-produccion-report',
  standalone: true,
  imports: [DateRangeFilterComponent, PageHeaderComponent, TranslatePipe, DecimalPipe],
  templateUrl: './comparacion-produccion-report.html',
  styleUrls: ['./comparacion-produccion-report.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparacionProduccionReport implements OnInit {
  private readonly router = inject(Router);
  private readonly repository = inject(LecheRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);

  private readonly _registros = signal<LecheRegistro[]>([]);
  private readonly _dateRange = signal<DateRange | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly svgDims = { width: 800, height: 360 };
  readonly padding = { top: 30, right: 40, bottom: 120, left: 70 };

  private readonly registrosSorted = computed(() =>
    [...this._registros()].sort((a, b) => {
      const da = parseFechaHora(a.fecha, a.hora);
      const db = parseFechaHora(b.fecha, b.hora);
      return da.getTime() - db.getTime();
    }),
  );

  private readonly chartData: Signal<ChartPoint[]> = computed(() =>
    toChartPoints(this.registrosSorted(), 'estandar'),
  );

  private readonly chart = createChartState(
    this.chartData,
    (pt, i) => this.registrosSorted()[i]?.fecha ?? '',
  );

  // ─── Propiedades expuestas para el template (delegan en chart) ──
  readonly chartW = this.chart.chartW;
  readonly chartH = this.chart.chartH;
  readonly yMax = this.chart.yMax;
  readonly yTicks = this.chart.yTicks;
  readonly xLabels = this.chart.xLabels;
  readonly scaleX = this.chart.scaleX;
  readonly scaleY = this.chart.scaleY;
  readonly polylineReal = this.chart.polylineReal;
  readonly areaReal = this.chart.areaReal;
  readonly totalReal = this.chart.totalReal;
  readonly polylineEstandar = this.chart.polylineSecond;
  readonly areaEstandar = this.chart.areaSecond;
  readonly totalEstandar = this.chart.totalSecond;

  readonly datos = computed<ChartRow[]>(() => {
    const r = this.registrosSorted();
    return this.chartData().map((pt, i) => ({
      fecha: r[i]?.fecha ?? '',
      label: r[i]?.fecha ?? '',
      real: pt.real,
      estandar: pt.second,
    }));
  });

  async ngOnInit(): Promise<void> {
    await this.cargarRegistros();
  }

  async cargarRegistros(filtros?: ConsultaFiltros): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.repository.getAll(filtros).pipe(takeUntilDestroyed(this.destroyRef)),
      );
      this._registros.set(data.items);
    } catch (err) {
      this.error.set(this.translateService.instant('leche.reportes.errors.loadData'));
      console.error('Error al cargar datos de producción:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onRangeChange(range: DateRange): Promise<void> {
    this._dateRange.set(range);
    const filtros: ConsultaFiltros = {};
    if (range.start) filtros.fechaDesde = toDateStr(range.start);
    if (range.end) filtros.fechaHasta = toDateStr(range.end);
    await this.cargarRegistros(Object.keys(filtros).length > 0 ? filtros : undefined);
  }

  onDownload(format: 'excel' | 'pdf'): void {
    if (format !== 'pdf') {
      console.log('Descargando como', format);
      return;
    }

    this.repository
      .downloadPdf(buildPdfFilters(this._dateRange(), { comparativo: true }))
      .subscribe((blob) => {
        openPdfBlob(blob);
      });
  }

  goBack(): void {
    this.router.navigate(['/leche/reporte']);
  }
}
