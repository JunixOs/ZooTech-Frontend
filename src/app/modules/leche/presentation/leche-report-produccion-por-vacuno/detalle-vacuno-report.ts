import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  LecheRepository,
  ConsultaFiltros,
} from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheRegistro, ReporteOrdeniosPdfFiltros } from '@modules/leche/domain/models/leche.model';
import { LecheReporteRepository } from '@modules/leche/domain/interfaces/leche-reporte.repository.interface';
import { ReporteLecheService } from '@modules/leche/infraestructure/services/reporte-leche.service';

@Component({
  selector: 'zt-detalle-vacuno-report',
  standalone: true,
  imports: [DateRangeFilterComponent, PaginatorComponent, TranslatePipe],
  templateUrl: './detalle-vacuno-report.html',
  styleUrls: ['./detalle-vacuno-report.css'],
  providers: [{ provide: LecheReporteRepository, useExisting: ReporteLecheService }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleVacunoReport implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(LecheRepository);
  private readonly reporteService = inject(LecheReporteRepository);
  private readonly translate = inject(TranslateService);

  private readonly _registros = signal<LecheRegistro[]>([]);
  private readonly _dateRange = signal<DateRange | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly codigoVacuno = signal<string>('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly expandedRows = signal<Set<number>>(new Set());

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
      const dateA = this.parseDate(a.fecha, a.hora);
      const dateB = this.parseDate(b.fecha, b.hora);
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
    const days = this.daysInRange();
    return this.registrosOrdenados().length > 0 ? this.registrosOrdenados().length * 15 : 0;
  });

  readonly dateRangeText = computed(() => {
    const range = this._dateRange();
    if (!range?.start || !range?.end) return '';
    const start = this.toDateStr(range.start);
    const end = this.toDateStr(range.end);
    return `${this.translate.instant('shared.filters.from')} ${start}  ${this.translate.instant('shared.filters.to')} ${end}`;
  });

  private readonly daysInRange = computed(() => {
    const range = this._dateRange();
    if (range?.start && range?.end) {
      const diff = range.end.getTime() - range.start.getTime();
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return 1;
  });

  async ngOnInit(): Promise<void> {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (codigo) {
      this.codigoVacuno.set(codigo);
      await this.cargarRegistros();
    }
  }

  async cargarRegistros(filtros?: ConsultaFiltros): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const query: ConsultaFiltros = { ...filtros, vacunoId: this.codigoVacuno() };
      const data = await firstValueFrom(this.repository.getAll(query));
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
    if (range.start) filtros.fechaDesde = this.toDateStr(range.start);
    if (range.end) filtros.fechaHasta = this.toDateStr(range.end);
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
    const headers = [
      this.translate.instant('leche.reportes.exports.headers.recordCode'),
      this.translate.instant('leche.reportes.exports.headers.date'),
      this.translate.instant('leche.reportes.exports.headers.time'),
      this.translate.instant('leche.reportes.exports.headers.responsible'),
      this.translate.instant('leche.reportes.exports.headers.liters'),
      this.translate.instant('leche.reportes.exports.headers.observations'),
    ];
    const sep = ';';
    const lines = [headers.join(sep)];
    for (const r of rows) {
      lines.push(
        [
          r.codigoRegistro,
          r.fecha,
          r.hora,
          (r['encargado'] as string) || '',
          String(r.litros),
          (r['observaciones'] as string) || '',
        ].join(sep),
      );
    }
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detalle-vacuno-${this.codigoVacuno()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onDownloadPdf(): void {
    this.reporteService.getReporteLeche(this.buildPdfFilters()).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  goBack(): void {
    this.router.navigate(['/leche/reporte/produccion-por-vacuno']);
  }

  private parseDate(fecha: string, hora: string): Date {
    const [d, m, y] = fecha.split('/').map(Number);
    const [h, min] = hora.split(':').map(Number);
    return new Date(y, m - 1, d, h, min);
  }

  private toDateStr(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private buildPdfFilters(): ReporteOrdeniosPdfFiltros {
    const filtros: ReporteOrdeniosPdfFiltros = { vacunoId: this.codigoVacuno() };
    const range = this._dateRange();

    if (range?.start) filtros.fechaDesde = this.toDateStr(range.start);
    if (range?.end) filtros.fechaHasta = this.toDateStr(range.end);

    return filtros;
  }
}
