import { computed, DestroyRef, Directive, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { TranslateService } from '@ngx-translate/core';
import {
  LecheRepository,
  ConsultaFiltros,
} from '@modules/leche/domain/interfaces/leche-repository.interface';
import {
  LECHE_REPORT_PAGE_SIZE,
  LecheRegistro,
  LecheVacunoOption,
} from '@modules/leche/domain/models/leche.model';
import { ProduccionVacuno } from '@modules/leche/domain/models/produccion-vacuno.model';
import { toDateStr } from './leche-report/leche-report.utils';

/**
 * Shared base for the "production by cattle" report listing (real production vs. an idoneo/
 * standard reference) and its comparison-report variant. Both concrete components group the
 * same `LecheRegistro` data by vacuno, paginate/filter it the same way, and compute the same
 * totals — the only things that vary are the navigation route used when a row is selected and
 * how the report is exported (see abstract members below).
 */
@Directive()
export abstract class ProductionVacunoReportBase implements OnInit {
  protected readonly router = inject(Router);
  protected readonly repository = inject(LecheRepository);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly translate = inject(TranslateService);

  private readonly _registros = signal<LecheRegistro[]>([]);
  private readonly _vacunosById = signal<Record<string, LecheVacunoOption>>({});
  private readonly _columnFilters = signal<Record<string, string>>({});
  protected readonly _dateRange = signal<DateRange | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly columns = signal<ColumnConfig[]>([
    {
      key: 'codigoVacuno',
      headerKey: 'leche.reportes.produccion-vacuno.codigo',
      filterable: true,
      sortable: true,
    },
    {
      key: 'nombreVacuno',
      headerKey: 'leche.reportes.produccion-vacuno.nombre',
      filterable: true,
      sortable: true,
    },
    {
      key: 'ultimaFecha',
      headerKey: 'leche.reportes.produccion-vacuno.fecha',
      filterable: true,
      sortable: true,
    },
    {
      key: 'litros',
      headerKey: 'leche.reportes.produccion-vacuno.litros',
      filterable: true,
      sortable: true,
      align: 'right',
    },
  ]);

  readonly actionLabel = 'leche.reportes.produccion-vacuno.ver';

  readonly groupedData = computed<ProduccionVacuno[]>(() => {
    const map = new Map<string, ProduccionVacuno>();
    const vacunosById = this._vacunosById();

    for (const r of this._registros()) {
      const vacunoId = r.vacunoId ?? r.vacunoCodigo;
      const vacuno = vacunosById[vacunoId];
      const existing = map.get(vacunoId);

      if (existing) {
        existing.litros += r.litros;
        if (r.fecha > existing.ultimaFecha) {
          existing.ultimaFecha = r.fecha;
        }
      } else {
        map.set(vacunoId, {
          vacunoId,
          codigoVacuno: vacuno?.codigo ?? r.vacunoCodigo,
          nombreVacuno: vacuno?.nombre ?? r.nombreVacuno ?? null,
          ultimaFecha: r.fecha,
          litros: r.litros,
        });
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => a.nombreVacuno?.localeCompare(b.nombreVacuno ?? '') ?? 0,
    );
  });

  readonly filteredData = computed<ProduccionVacuno[]>(() => {
    const data = this.groupedData();
    const filters = this._columnFilters();
    const keys = Object.keys(filters);
    if (keys.length === 0) return data;

    return data.filter((row) =>
      keys.every((key) => {
        const filterVal = filters[key].toLowerCase();
        if (!filterVal) return true;
        const cellVal = String(row[key] ?? '').toLowerCase();
        return cellVal.includes(filterVal);
      }),
    );
  });

  readonly paginatedData = computed<ProduccionVacuno[]>(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    return this.filteredData().slice((page - 1) * size, page * size);
  });

  readonly totalItems = computed(() => this.filteredData().length);

  readonly totalLitrosReal = computed(() =>
    this.filteredData().reduce((sum, row) => sum + row.litros, 0),
  );

  private readonly daysInRange = computed(() => {
    const range = this._dateRange();
    if (range?.start && range?.end) {
      const diff = range.end.getTime() - range.start.getTime();
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return 30;
  });

  readonly totalLitrosIdoneo = computed(() => this.filteredData().length * this.daysInRange() * 15);

  /** Absolute route to navigate to when a row action is triggered (vacunoId is appended). */
  protected abstract readonly detailRoutePath: string;

  async ngOnInit(): Promise<void> {
    await this.cargarRegistros();
  }

  async cargarRegistros(filtros?: ConsultaFiltros): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const { registros, vacunos } = await firstValueFrom(
        forkJoin({
          registros: this.cargarTodosLosOrdenios(filtros),
          vacunos: this.repository.getVacunos().pipe(takeUntilDestroyed(this.destroyRef)),
        }),
      );

      this._registros.set(registros);
      this._vacunosById.set(Object.fromEntries(vacunos.map((vacuno) => [String(vacuno.id), vacuno])));
    } catch (err) {
      this.error.set(this.translate.instant('leche.reportes.errors.loadData'));
      console.error('Error al cargar datos de producción por vacuno:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onRangeChange(range: DateRange): Promise<void> {
    this._dateRange.set(range);
    this.currentPage.set(1);
    await this.cargarRegistros(this.buildDateFilters());
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  async onColumnFilter(filters: Record<string, string>): Promise<void> {
    this._columnFilters.set(filters);
    this.currentPage.set(1);
    await this.cargarRegistros(this.buildDateFilters());
  }

  onViewVacuno(row: Record<string, unknown>): void {
    const vacunoId = String(row['vacunoId'] ?? row['codigoVacuno'] ?? '');
    if (!vacunoId) return;
    this.router.navigate([this.detailRoutePath, vacunoId]);
  }

  goBack(): void {
    this.router.navigate(['/leche/reporte']);
  }

  private buildDateFilters(): ConsultaFiltros {
    const range = this._dateRange();
    const filtros: ConsultaFiltros = {};
    if (range?.start) filtros.fechaDesde = toDateStr(range.start);
    if (range?.end) filtros.fechaHasta = toDateStr(range.end);
    return filtros;
  }

  private async cargarTodosLosOrdenios(filtros?: ConsultaFiltros): Promise<LecheRegistro[]> {
    const firstPage = await firstValueFrom(
      this.repository
        .getAll({ ...filtros, page: 1, pageSize: LECHE_REPORT_PAGE_SIZE })
        .pipe(takeUntilDestroyed(this.destroyRef)),
    );
    const registros = [...firstPage.items];

    for (let page = 2; page <= firstPage.totalPaginas; page++) {
      const nextPage = await firstValueFrom(
        this.repository
          .getAll({ ...filtros, page, pageSize: firstPage.limitePorPagina })
          .pipe(takeUntilDestroyed(this.destroyRef)),
      );
      registros.push(...nextPage.items);
    }

    return registros;
  }
}
