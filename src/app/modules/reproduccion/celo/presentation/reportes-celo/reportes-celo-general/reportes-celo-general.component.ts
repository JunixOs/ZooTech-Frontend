import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { CeloFacade } from '../../../application/celo.facade';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button.component';
import { BackLinkComponent } from '@shared/components/back-link/back-link.component';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';

@Component({
  selector: 'zt-reportes-celo-general',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    DateRangeFilterComponent,
    DataTableComponent,
    PageHeaderComponent,
    IconButtonComponent,
    DownloadButtonComponent,
    BackLinkComponent,
  ],
  templateUrl: './reportes-celo-general.component.html',
  styleUrl: './reportes-celo-general.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesCeloGeneralComponent implements OnInit {
  private readonly facade = inject(CeloFacade);

  readonly isLoading = signal(false);
  private readonly dateRange = signal<DateRange>({ start: null, end: null });
  private readonly tempDateRange = signal<DateRange>({ start: null, end: null });

  readonly searchTerm = signal('');
  readonly columnFilters = signal<Record<string, string>>({});
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly columns: ColumnConfig[] = [
    {
      key: 'codigoRegistro',
      headerKey: 'reproduccion.celo.columns.codigoRegistro',
      sortable: true,
      filterable: true,
      width: '130px',
    },
    {
      key: 'fecha',
      headerKey: 'reproduccion.celo.columns.fecha',
      sortable: true,
      filterable: true,
      width: '120px',
    },
    {
      key: 'hora',
      headerKey: 'reproduccion.celo.columns.hora',
      sortable: true,
      filterable: true,
      width: '110px',
    },
    {
      key: 'codigoVacuno',
      headerKey: 'reproduccion.celo.columns.codigo',
      sortable: true,
      filterable: true,
      width: '120px',
    },
    {
      key: 'nombreVacuno',
      headerKey: 'reproduccion.celo.columns.nombre',
      sortable: true,
      filterable: true,
      width: 'auto',
    },
    {
      key: 'vecesEnCelo',
      headerKey: 'reproduccion.celo.columns.vecesEnCelo',
      sortable: true,
      filterable: true,
      align: 'center',
      width: '130px',
    },
    {
      key: 'caracteristicas',
      headerKey: 'reproduccion.celo.columns.caracteristicas',
      sortable: true,
      filterable: true,
      align: 'center',
      width: '140px',
    },
    {
      key: 'crias',
      headerKey: 'reproduccion.celo.columns.crias',
      sortable: true,
      filterable: true,
      align: 'center',
      width: '90px',
    },
  ];

  readonly filteredData = computed(() => {
    let data = this.facade.celos() as any[];  

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

      data = data.filter((item) =>
        String(item[key] ?? '').toLowerCase().includes(colTerm),
      );
    }

    return data;
  });

  readonly totalItems = computed(() => this.filteredData().length);

  readonly paginatedData = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();

    return this.filteredData()
      .slice(start, start + this.pageSize())
      .map((item) => ({
        codigoRegistro: item.codigoRegistro ?? item.codigo ?? '-',
        fecha: item.fecha ?? '-',
        hora: item.hora ?? '-',
        codigoVacuno: item.codigoVacuno ?? item.codigo ?? '-',
        nombreVacuno: item.nombreVacuno ?? item.nombre ?? '-',
        vecesEnCelo: item.vecesEnCelo ?? 0,
        caracteristicas: item.caracteristicas ?? item.caracteristicaCodes?.length ?? '-',
        crias: item.crias ?? 0,
      }));
  });

  ngOnInit(): void {
    this.cargarReporteGeneral();
  }

  onDateRangeChange(range: DateRange): void {
    this.tempDateRange.set(range);

    if (range.start === null && range.end === null) {
      this.dateRange.set(range);
      this.currentPage.set(1);
    }
  }

  onApplyFilters(): void {
    this.dateRange.set(this.tempDateRange());
    this.currentPage.set(1);
    this.cargarReporteGeneral();
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

  private cargarReporteGeneral(): void {
    this.facade.cargarReporteCeloGeneral();
  }

  private formatDateParam(date: Date | null): string | undefined {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
