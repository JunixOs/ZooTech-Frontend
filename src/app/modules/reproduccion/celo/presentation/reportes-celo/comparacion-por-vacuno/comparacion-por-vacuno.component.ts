import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { CeloFacade } from '../../../application/celo.facade';
import { ReporteCeloPorVacuno } from '../../../domain/models/reporte-celo-vacuno.model';

import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { DownloadMenuComponent } from '@shared/components/download-menu/download-menu.component';
import { BackLinkComponent } from '@shared/components/back-link/back-link.component';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { ExportColumn } from '@shared/utils/export-table.util';
import { ExportService } from '@shared/services/export.service';

@Component({
  selector: 'zt-comparacion-por-vacuno',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    DateRangeFilterComponent,
    DataTableComponent,
    PageHeaderComponent,
    IconButtonComponent,
    DownloadMenuComponent,
    BackLinkComponent,
  ],
  templateUrl: './comparacion-por-vacuno.component.html',
  styleUrl: './comparacion-por-vacuno.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparacionPorVacunoComponent implements OnInit {
  private readonly facade = inject(CeloFacade);
  private readonly router = inject(Router);
  private readonly exportService = inject(ExportService);

  readonly isLoading = this.facade.isLoading;
  readonly error = this.facade.error;

  private readonly dateRange = signal<DateRange>({ start: null, end: null });
  private readonly tempDateRange = signal<DateRange>({ start: null, end: null });

  readonly searchTerm = signal('');
  readonly columnFilters = signal<Record<string, string>>({});
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  private readonly exportColumns: ExportColumn[] = [
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
        'Comparación por vacuno',
        this.exportColumns,
        this.filteredData() as unknown as Record<string, unknown>[],
        'comparacion-celos-por-vacuno.xlsx',
      )
      .subscribe();
  }

  descargarPdf(): void {
    this.exportService
      .descargar(
        'pdf',
        'Comparación de celos real vs estándar por vacuno',
        this.exportColumns,
        this.filteredData() as unknown as Record<string, unknown>[],
        'comparacion-celos-por-vacuno.pdf',
      )
      .subscribe();
  }

  verGrafico(row: Record<string, unknown>): void {
    const codigoVacuno = String(row['codigoVacuno'] ?? '');
    const nombre = String(row['nombre'] ?? '');

    if (!codigoVacuno) return;

    this.router.navigate(
      [
        '/reproduccion/celo/reportes/comparacion-por-vacuno',
        codigoVacuno,
      ],
      {
        queryParams: {
          nombre,
        },
      },
    );
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
