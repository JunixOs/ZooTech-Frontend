import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import {
  DownloadButtonComponent,
  DownloadFormat,
} from '@shared/components/download-button/download-button';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ConsultaFiltros,
} from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheSequiaService } from '@modules/leche/applications/services/leche-sequia.service';
import { VacunoSequia } from '@modules/leche/domain/models/leche.model';
import {
  toDateStr,
  generateCSV,
  downloadFile,
  createTableState,
} from '../leche-report/leche-report.utils';

@Component({
  selector: 'zt-vacas-sequia-report',
  standalone: true,
  imports: [
    DataTableComponent,
    DateRangeFilterComponent,
    DownloadButtonComponent,
    PageHeaderComponent,
    TranslatePipe,
  ],
  templateUrl: './vacas-sequia-report.html',
  styleUrls: ['./vacas-sequia-report.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacasSequiaReport implements OnInit {
  private readonly router = inject(Router);
  private readonly sequiaService = inject(LecheSequiaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  private readonly _dateRange = signal<DateRange | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly vacasActualesData = signal<VacunoSequia[]>([]);
  readonly vacasFuturasData = signal<VacunoSequia[]>([]);
  readonly vacasHistoricasData = signal<VacunoSequia[]>([]);

  readonly actuales = createTableState(this.vacasActualesData);
  readonly futuros = createTableState(this.vacasFuturasData);
  readonly historicos = createTableState(this.vacasHistoricasData);

  readonly columnsActuales = signal<ColumnConfig[]>([
    {
      key: 'codigoVacuno',
      headerKey: 'leche.reportes.vacas-sequia.codigo',
      filterable: true,
      sortable: true,
    },
    {
      key: 'nombreVacuno',
      headerKey: 'leche.reportes.vacas-sequia.nombre',
      filterable: true,
      sortable: true,
    },
    {
      key: 'desde',
      headerKey: 'leche.reportes.vacas-sequia.desde',
      filterable: true,
      sortable: true,
    },
    {
      key: 'probablementeHasta',
      headerKey: 'leche.reportes.vacas-sequia.probablementeHasta',
      filterable: true,
      sortable: true,
    },
  ]);

  readonly columnsFuturos = signal<ColumnConfig[]>([
    {
      key: 'codigoVacuno',
      headerKey: 'leche.reportes.vacas-sequia.codigo',
      filterable: true,
      sortable: true,
    },
    {
      key: 'nombreVacuno',
      headerKey: 'leche.reportes.vacas-sequia.nombre',
      filterable: true,
      sortable: true,
    },
    {
      key: 'probablementeDesde',
      headerKey: 'leche.reportes.vacas-sequia.probablementeDesde',
      filterable: true,
      sortable: true,
    },
    {
      key: 'probablementeHasta',
      headerKey: 'leche.reportes.vacas-sequia.probablementeHasta',
      filterable: true,
      sortable: true,
    },
  ]);

  readonly columnsHistoricos = signal<ColumnConfig[]>([
    {
      key: 'codigoVacuno',
      headerKey: 'leche.reportes.vacas-sequia.codigo',
      filterable: true,
      sortable: true,
    },
    {
      key: 'nombreVacuno',
      headerKey: 'leche.reportes.vacas-sequia.nombre',
      filterable: true,
      sortable: true,
    },
    {
      key: 'desde',
      headerKey: 'leche.reportes.vacas-sequia.desde',
      filterable: true,
      sortable: true,
    },
    {
      key: 'hasta',
      headerKey: 'leche.reportes.vacas-sequia.hasta',
      filterable: true,
      sortable: true,
    },
  ]);

  readonly actionLabel = 'leche.reportes.vacas-sequia.ver';

  readonly dateRangeText = computed(() => {
    const range = this._dateRange();
    if (!range?.start || !range?.end) return '';
    return `${this.translate.instant('leche.reportes.common.from')}: ${toDateStr(range.start)}  ${this.translate.instant('leche.reportes.common.to')}: ${toDateStr(range.end)}`;
  });

  async ngOnInit(): Promise<void> {
    await this.cargarRegistros();
  }

  async cargarRegistros(filtros?: ConsultaFiltros): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(
        this.sequiaService.getVacasEnSequia(filtros).pipe(takeUntilDestroyed(this.destroyRef)),
      );
      this.vacasActualesData.set(response.actuales);
      this.vacasFuturasData.set(response.futuros);
      this.vacasHistoricasData.set(response.historicos);
      this.actuales.currentPage.set(1);
      this.futuros.currentPage.set(1);
      this.historicos.currentPage.set(1);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : this.translate.instant('leche.reportes.errors.unknown');
      this.error.set(msg);
      console.error('[VacasSequia] Error al cargar datos:', err);
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

  onPageChange(table: 'actuales' | 'futuros' | 'historicos', page: number): void {
    this[table].currentPage.set(page);
  }

  onPageSizeChange(table: 'actuales' | 'futuros' | 'historicos', size: number): void {
    const state = this[table];
    state.pageSize.set(size);
    state.currentPage.set(1);
  }

  onColumnFilter(
    table: 'actuales' | 'futuros' | 'historicos',
    filters: Record<string, string>,
  ): void {
    const state = this[table];
    state.columnFilters.set(filters);
    state.currentPage.set(1);
  }

  onViewVacuno(row: Record<string, unknown>): void {
    const vacunoId = String(row['vacunoId'] ?? '');
    if (!vacunoId) return;
    this.router.navigate(['/leche/reporte/produccion-por-vacuno', vacunoId]);
  }

  onDownload(format: DownloadFormat): void {
    if (format === 'excel') {
      this.onDownloadExcel();
      return;
    }

    this.onDownloadPdf();
  }

  onDownloadExcel(): void {
    const allData = [
      ...this.vacasActualesData(),
      ...this.vacasFuturasData(),
      ...this.vacasHistoricasData(),
    ];
    const headers = [
      this.translate.instant('leche.reportes.exports.headers.cattleCode'),
      this.translate.instant('leche.reportes.exports.headers.name'),
      this.translate.instant('leche.reportes.vacas-sequia.desde'),
      this.translate.instant('leche.reportes.vacas-sequia.probablementeDesde'),
      this.translate.instant('leche.reportes.vacas-sequia.probablementeHasta'),
      this.translate.instant('leche.reportes.vacas-sequia.hasta'),
    ];
    const csvContent = generateCSV(allData, headers, (r) => [
      r.codigoVacuno,
      r.nombreVacuno ?? '',
      r.desde || '',
      r.probablementeDesde || '',
      r.probablementeHasta || '',
      r.hasta || '',
    ]);
    downloadFile(csvContent, 'vacas-sequia.csv', 'text/csv');
  }

  onDownloadPdf(): void {
    globalThis.print();
  }

  goBack(): void {
    this.router.navigate(['/leche/reporte']);
  }

  goBackComparativo(): void {
    this.router.navigate(['/leche/reporte/vacas-sequia']);
  }
}
