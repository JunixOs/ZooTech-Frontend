import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  LecheRepository,
  ConsultaFiltros,
} from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheRegistro } from '@modules/leche/domain/models/leche.model';
import {
  toDateStr,
  generateCSV,
  downloadFile,
  parseFechaHora,
  openPdfBlob,
  buildPdfFilters,
  dateRangeText,
} from '../leche-report/leche-report.utils';

@Component({
  selector: 'zt-detalle-vacuno-report',
  standalone: true,
  imports: [DateRangeFilterComponent, PageHeaderComponent, PaginatorComponent, TranslatePipe],
  templateUrl: './detalle-vacuno-report.html',
  styleUrls: ['./detalle-vacuno-report.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleVacunoReport implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(LecheRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  private readonly _registros = signal<LecheRegistro[]>([]);
  private readonly _dateRange = signal<DateRange | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly vacunoId = signal<string>('');
  private readonly backRoute = signal(
    this.route.snapshot.data['backRoute'] ?? '/leche/reporte/produccion-por-vacuno',
  );
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly expandedRows = signal<Set<number>>(new Set());

  private isValidVacunoId(value: string): boolean {
    return /^\d+$/.test(value.trim());
  }

  readonly columns = signal<ColumnConfig[]>([
    {
      key: 'codigoRegistro',
      headerKey: 'leche.reportes.produccion-vacuno-detalle.codigoRegistro',
      sortable: true,
    },
    { key: 'fecha', headerKey: 'leche.reportes.produccion-vacuno-detalle.fecha', sortable: true },
    { key: 'hora', headerKey: 'leche.reportes.produccion-vacuno-detalle.hora', sortable: true },
    {
      key: 'encargado',
      headerKey: 'leche.reportes.produccion-vacuno-detalle.encargado',
      sortable: true,
    },
    {
      key: 'litros',
      headerKey: 'leche.reportes.produccion-vacuno-detalle.litros',
      sortable: true,
      align: 'right',
    },
  ]);

  readonly nombreVacuno = computed(() => {
    const r = this._registros();
    return r.length > 0 ? r[0].nombreVacuno : '';
  });

  readonly registrosOrdenados = computed(() =>
    [...this._registros()].sort((a, b) => {
      const dateA = parseFechaHora(a.fecha, a.hora);
      const dateB = parseFechaHora(b.fecha, b.hora);
      return dateB.getTime() - dateA.getTime();
    }),
  );

  readonly Math = Math;

  readonly totalItems = computed(() => this.registrosOrdenados().length);
  readonly startItem = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  readonly endItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems()),
  );

  readonly paginatedData = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    return this.registrosOrdenados().slice((page - 1) * size, page * size);
  });

  readonly totalLitrosReal = computed(() =>
    this.registrosOrdenados().reduce((sum, r) => sum + r.litros, 0),
  );

  readonly totalLitrosIdoneo = computed(() => {
    return this.registrosOrdenados().length > 0 ? this.registrosOrdenados().length * 15 : 0;
  });

  readonly dateRangeText = computed(() => dateRangeText(this._dateRange()));

  private readonly daysInRange = computed(() => {
    const range = this._dateRange();
    if (range?.start && range?.end) {
      const diff = range.end.getTime() - range.start.getTime();
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return 1;
  });

  async ngOnInit(): Promise<void> {
    const vacunoId = this.route.snapshot.paramMap.get('codigo');
    if (vacunoId && this.isValidVacunoId(vacunoId)) {
      this.vacunoId.set(vacunoId);
      await this.cargarRegistros();
      return;
    }

    this.error.set('Identificador de vacuno invalido');
  }

  async cargarRegistros(filtros?: ConsultaFiltros): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const query: ConsultaFiltros = { ...filtros, vacunoId: this.vacunoId() };
      const data = await firstValueFrom(
        this.repository.getAll(query).pipe(takeUntilDestroyed(this.destroyRef)),
      );
      this._registros.set(data);
      this.currentPage.set(1);
      this.expandedRows.set(new Set());
    } catch (err) {
      this.error.set(this.translate.instant('leche.reportes.errors.loadData'));
      console.error('Error al cargar datos de detalle de vacuno:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onRangeChange(range: DateRange): Promise<void> {
    this._dateRange.set(range);
    const filtros: ConsultaFiltros = {};
    if (range.start) filtros.fechaDesde = toDateStr(range.start);
    if (range.end) filtros.fechaHasta = toDateStr(range.end);
    await this.cargarRegistros(filtros);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  toggleRow(index: number): void {
    this.expandedRows.update((set) => {
      const next = new Set(set);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  isRowExpanded(index: number): boolean {
    return this.expandedRows().has(index);
  }

  hasObservaciones(row: LecheRegistro): boolean {
    const obs = row['observaciones'] as string | undefined;
    return !!obs && obs.trim().length > 0;
  }

  onDownloadExcel(): void {
    const rows = this.registrosOrdenados();
    const headers = ['Código Registro', 'Fecha', 'Hora', 'Encargado', 'Litros', 'Observaciones'];
    const csvContent = generateCSV(rows, headers, (r) => [
      r.codigoRegistro,
      r.fecha,
      r.hora,
      (r['encargado'] as string) || '',
      String(r.litros),
      (r['observaciones'] as string) || '',
    ]);
    downloadFile(csvContent, `detalle-vacuno-${this.vacunoId()}.csv`, 'text/csv');
  }

  onDownloadPdf(): void {
    this.repository
      .downloadPdf(buildPdfFilters(this._dateRange(), { vacunoId: this.vacunoId() }))
      .subscribe((blob) => {
        openPdfBlob(blob);
      });
  }

  goBack(): void {
    this.router.navigate([this.backRoute()]);
  }
}
