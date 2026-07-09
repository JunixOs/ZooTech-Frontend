import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';
import {
  LecheRepository,
  ConsultaFiltros,
} from '@modules/leche/domain/interfaces/leche-repository.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'zt-produccion-diaria-report',
  standalone: true,
  imports: [
    DataTableComponent,
    DateRangeFilterComponent,
    DownloadButtonComponent,
    PageHeaderComponent,
    DecimalPipe,
    TranslatePipe,
  ],
  templateUrl: './produccion-diaria-report.html',
  styleUrls: ['./produccion-diaria-report.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProduccionDiariaReport implements OnInit {
  private router = inject(Router);
  private readonly lecheFacade = inject(LecheFacade);
  private readonly lecheRepository = inject(LecheRepository);
  private readonly filtrosActuales = signal<ConsultaFiltros>({});

  registros = this.lecheFacade.registros;
  loading = this.lecheFacade.loading;
  totalItems = this.lecheFacade.totalItems;
  dateRange = signal<DateRange>({ start: null, end: null });

  currentPage = signal(1);
  pageSize = signal(10);
  columnFilters = signal<Record<string, string>>({});

  filteredData = computed(() => {
    let data = this.registros();
    const filters = this.columnFilters();

    const filterKeys = Object.keys(filters);
    if (filterKeys.length > 0) {
      data = data.filter((row) =>
        filterKeys.every((key) => {
          const filterValue = filters[key]?.toLowerCase().trim();
          if (!filterValue) return true;

          return String(row[key] ?? '')
            .toLowerCase()
            .includes(filterValue);
        }),
      );
    }

    return data;
  });

  tableData = computed<Record<string, unknown>[]>(() =>
    this.filteredData().map((item): Record<string, unknown> => ({ ...item })),
  );

  // Configuración de las columnas para zt-data-table
  columns = signal<ColumnConfig[]>([
    { key: 'codigoRegistro', headerKey: 'Código de registro', filterable: true, sortable: true },
    { key: 'fecha', headerKey: 'Fecha', filterable: true, sortable: true },
    { key: 'hora', headerKey: 'Hora', filterable: true },
    { key: 'nombreVacuno', headerKey: 'Nombre', filterable: true, sortable: true },
    { key: 'codigoVacuno', headerKey: 'Código Vacuno', filterable: true },
    { key: 'litros', headerKey: 'Litros', filterable: false, sortable: true, align: 'right' },
  ]);

  totalLitrosReal = computed(() => {
    return this.filteredData().reduce((acc, curr) => acc + curr.litros, 0);
  });

  totalLitrosIdoneo = computed(() => {
    return this.filteredData().reduce((acc, curr) => acc + Number(curr['litrosIdoneos'] ?? 0), 0);
  });

  ngOnInit(): void {
    this.loadPage();
  }

  onRangeChange(range: DateRange): void {
    this.dateRange.set(range);
    this.currentPage.set(1);
    this.loadPage();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPage();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadPage();
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
    this.currentPage.set(1);
  }

  goBack(): void {
    this.router.navigate(['/leche/reporte']);
  }

  private buildFilters(): ConsultaFiltros {
    const range = this.dateRange();
    return {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      fechaDesde: range.start ? range.start.toISOString().split('T')[0] : undefined,
      fechaHasta: range.end ? range.end.toISOString().split('T')[0] : undefined,
    };
  }

  private loadPage(): void {
    this.lecheFacade.cargarRegistros(this.buildFilters());
  }

  async onDownload(format: 'excel' | 'pdf'): Promise<void> {
    try {
      const range = this.dateRange();

      const filtros: ConsultaFiltros = {};
      if (range.start) filtros.fechaDesde = new Date(range.start).toISOString().split('T')[0];
      if (range.end) filtros.fechaHasta = new Date(range.end).toISOString().split('T')[0];

      const config = {
        excel: { ext: 'xlsx', call: () => this.lecheRepository.downloadExcel(filtros) },
        pdf: { ext: 'pdf', call: () => this.lecheRepository.downloadPdf(filtros) },
      }[format];

      const blob = await firstValueFrom(config.call());
      const url = window.URL.createObjectURL(blob);

      // Descarga limpia en una sola línea
      Object.assign(document.createElement('a'), {
        href: url,
        download: `produccion-diaria-${Date.now()}.${config.ext}`,
      }).click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error al descargar formato ${format}:`, err);
    }
  }
}
