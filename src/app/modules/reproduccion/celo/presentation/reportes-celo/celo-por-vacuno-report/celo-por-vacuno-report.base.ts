import { Directive, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CeloFacade } from '../../../application/celo.facade';
import { ReporteCeloPorVacuno } from '../../../domain/models/reporte-celo-vacuno.model';

import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { ExportColumn } from '@shared/utils/export-table.util';
import { ExportService } from '@shared/services/export.service';

@Directive()
export abstract class CeloPorVacunoReportBase implements OnInit {
  protected readonly facade = inject(CeloFacade);
  protected readonly router = inject(Router);
  protected readonly exportService = inject(ExportService);

  readonly isLoading = this.facade.isLoading;
  readonly error = this.facade.error;

  private readonly dateRange = signal<DateRange>({ start: null, end: null });
  private readonly tempDateRange = signal<DateRange>({ start: null, end: null });

  readonly searchTerm = signal('');
  readonly columnFilters = signal<Record<string, string>>({});
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  protected readonly exportColumns: ExportColumn[] = [
    { header: 'Código Vacuno', key: 'codigoVacuno' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'Último Celo', key: 'ultimoCelo' },
    { header: 'Veces en Celo', key: 'vecesEnCelo' },
  ];

  readonly columns: ColumnConfig[] = [
    {
      key: 'codigoVacuno',
      headerKey: 'reproduccion.celo.vacas.columns.codigoVacuno',
      sortable: true,
      filterable: true,
      width: '150px',
    },
    {
      key: 'nombre',
      headerKey: 'reproduccion.celo.vacas.columns.nombre',
      sortable: true,
      filterable: true,
      width: 'auto',
    },
    {
      key: 'ultimoCelo',
      headerKey: 'reproduccion.celo.reportes.byCattle.columns.lastHeat',
      sortable: true,
      filterable: true,
      width: '150px',
      align: 'center',
    },
    {
      key: 'vecesEnCelo',
      headerKey: 'reproduccion.celo.columns.vecesEnCelo',
      sortable: true,
      filterable: true,
      width: '150px',
      align: 'center',
    },
  ];

  readonly filteredData = computed(() => {
    let data = this.facade.reporteCeloPorVacuno() as ReporteCeloPorVacuno[];

    const term = this.searchTerm().toLowerCase().trim();
    const colFilters = this.columnFilters();

    if (term) {
      data = data.filter((item) =>
        Object.values(item).some((value) =>
          String(value ?? '').toLowerCase().includes(term),
        ),
      );
    }

    for (const [key, val] of Object.entries(colFilters)) {
      if (!val) continue;

      const colTerm = val.toLowerCase().trim();

      data = data.filter((item) => {
        const value = item[key as keyof ReporteCeloPorVacuno];

        return String(value ?? '')
          .toLowerCase()
          .includes(colTerm);
      });
    }

    return data;
  });

  readonly totalItems = computed(() => this.filteredData().length);

  readonly paginatedData = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();

    return this.filteredData()
      .slice(start, start + this.pageSize())
      .map((item) => ({
        codigoVacuno: item.codigoVacuno,
        nombre: item.nombre,
        ultimoCelo: item.ultimoCelo,
        vecesEnCelo: item.vecesEnCelo,
      }));
  });

  /** Translation key for the page title and breadcrumb current segment. */
  abstract readonly pageTitleKey: string;
  /** FontAwesome icon shown on the row action button. */
  abstract readonly actionIcon: string;
  /** Absolute route to navigate to on row action (codigoVacuno is appended). */
  abstract readonly detailRoutePath: string;
  protected abstract readonly excelExportTitle: string;
  protected abstract readonly pdfExportTitle: string;
  protected abstract readonly exportFileNamePrefix: string;

  ngOnInit(): void {
    this.cargarReporteCeloPorVacuno();
  }

  onDateRangeChange(range: DateRange): void {
    this.tempDateRange.set(range);

    if (range.start === null && range.end === null) {
      this.dateRange.set(range);
      this.currentPage.set(1);
      this.cargarReporteCeloPorVacuno();
    }
  }

  onApplyFilters(): void {
    this.dateRange.set(this.tempDateRange());
    this.currentPage.set(1);
    this.cargarReporteCeloPorVacuno();
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
    this.currentPage.set(1);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  descargarExcel(): void {
    this.exportService
      .descargar(
        'excel',
        this.excelExportTitle,
        this.exportColumns,
        this.filteredData() as unknown as Record<string, unknown>[],
        `${this.exportFileNamePrefix}.xlsx`,
      )
      .subscribe();
  }

  descargarPdf(): void {
    this.exportService
      .descargar(
        'pdf',
        this.pdfExportTitle,
        this.exportColumns,
        this.filteredData() as unknown as Record<string, unknown>[],
        `${this.exportFileNamePrefix}.pdf`,
      )
      .subscribe();
  }

  onRowAction(row: Record<string, unknown>): void {
    const codigoVacuno = String(row['codigoVacuno'] ?? '');
    const nombre = String(row['nombre'] ?? '');

    if (!codigoVacuno) return;

    this.router.navigate([this.detailRoutePath, codigoVacuno], {
      queryParams: { nombre },
    });
  }

  private cargarReporteCeloPorVacuno(): void {
    const range = this.dateRange();
    this.facade.cargarReporteCeloPorVacuno(
      this.formatDateParam(range.start),
      this.formatDateParam(range.end),
    );
  }

  private formatDateParam(date: Date | null): string | undefined {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
