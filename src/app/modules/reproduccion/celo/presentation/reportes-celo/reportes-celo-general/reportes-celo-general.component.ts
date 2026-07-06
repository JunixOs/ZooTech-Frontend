import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { CeloFacade } from '../../../application/celo.facade';
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
import { createServerTableState } from '@shared/utils/server-table-state';

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
    DownloadMenuComponent,
    BackLinkComponent,
  ],
  templateUrl: './reportes-celo-general.component.html',
  styleUrl: './reportes-celo-general.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesCeloGeneralComponent implements OnInit {
  private readonly facade = inject(CeloFacade);
  private readonly exportService = inject(ExportService);

  // Búsqueda, paginación y rango de fechas viven en el servidor:
  // `createServerTableState` llama a `facade.cargarReporteCeloGeneral` con
  // { search, page, pageSize, fechaInicio, fechaFin } y expone la página
  // actual + el total real. El filtro por columna queda fuera de alcance
  // (necesitaría un query param distinto por columna); por eso se oculta la
  // UI de filtro por columna en el template (`filterable: false` en `columns`).
  private readonly tableState = createServerTableState(
    ({ search, page, pageSize, fechaInicio, fechaFin }) =>
      this.facade.cargarReporteCeloGeneral({ search, page, pageSize, fechaInicio, fechaFin }),
  );
  readonly isLoading = this.tableState.isLoading;
  private readonly tempDateRange = signal<DateRange>({ start: null, end: null });

  readonly searchTerm = this.tableState.searchTerm;
  readonly currentPage = this.tableState.currentPage;
  readonly pageSize = this.tableState.pageSize;

  private readonly exportColumns: ExportColumn[] = [
    { header: 'Código Registro', key: 'codigoRegistro' },
    { header: 'Fecha', key: 'fecha' },
    { header: 'Hora', key: 'hora' },
    { header: 'Código Vacuno', key: 'codigoVacuno' },
    { header: 'Nombre', key: 'nombreVacuno' },
    { header: 'Veces en Celo', key: 'vecesEnCelo' },
    { header: 'Características', key: 'caracteristicas' },
    { header: 'Crías', key: 'crias' },
  ];

  readonly columns: ColumnConfig[] = [
    {
      key: 'codigoRegistro',
      headerKey: 'reproduccion.celo.columns.codigoRegistro',
      sortable: true,
      // El filtro por columna no tiene soporte en el backend para este
      // endpoint (necesitaría un query param distinto por columna, fuera de
      // alcance); se deja `filterable: false` para ocultar la UI en
      // `zt-data-table` en vez de mostrar un filtro que no funciona.
      filterable: false,
      width: '130px',
    },
    {
      key: 'fecha',
      headerKey: 'reproduccion.celo.columns.fecha',
      sortable: true,
      filterable: false,
      width: '120px',
    },
    {
      key: 'hora',
      headerKey: 'reproduccion.celo.columns.hora',
      sortable: true,
      filterable: false,
      width: '110px',
    },
    {
      key: 'codigoVacuno',
      headerKey: 'reproduccion.celo.columns.codigo',
      sortable: true,
      filterable: false,
      width: '120px',
    },
    {
      key: 'nombreVacuno',
      headerKey: 'reproduccion.celo.columns.nombre',
      sortable: true,
      filterable: false,
      width: 'auto',
    },
    {
      key: 'vecesEnCelo',
      headerKey: 'reproduccion.celo.columns.vecesEnCelo',
      sortable: true,
      filterable: false,
      align: 'center',
      width: '130px',
    },
    {
      key: 'caracteristicas',
      headerKey: 'reproduccion.celo.columns.caracteristicas',
      sortable: true,
      filterable: false,
      align: 'center',
      width: '140px',
    },
    {
      key: 'crias',
      headerKey: 'reproduccion.celo.columns.crias',
      sortable: true,
      filterable: false,
      align: 'center',
      width: '90px',
    },
  ];

  readonly totalItems = this.tableState.totalItems;

  // La búsqueda, paginación y rango de fechas ya se resuelven en el servidor
  // (ver `tableState`); acá solo se normalizan los nombres de campo para la
  // tabla y la exportación, sin ningún recorte adicional en el cliente.
  readonly normalizedData = computed<Record<string, unknown>[]>(() =>
    (this.tableState.data() as any[]).map((item) => ({
      codigoRegistro: item.codigoRegistro ?? item.codigo ?? '-',
      fecha: item.fecha ?? '-',
      hora: item.hora ?? '-',
      codigoVacuno: item.codigoVacuno ?? item.codigo ?? '-',
      nombreVacuno: item.nombreVacuno ?? item.nombre ?? '-',
      vecesEnCelo: item.vecesEnCelo ?? 0,
      caracteristicas: item.caracteristicas ?? item.caracteristicaCodes?.length ?? '-',
      crias: item.crias ?? 0,
    })),
  );

  ngOnInit(): void {
    this.tableState.init();
  }

  onDateRangeChange(range: DateRange): void {
    this.tempDateRange.set(range);

    if (range.start === null && range.end === null) {
      this.tableState.onDateRangeChange({});
    }
  }

  onApplyFilters(): void {
    const range = this.tempDateRange();

    this.tableState.onDateRangeChange({
      fechaInicio: this.formatDateParam(range.start),
      fechaFin: this.formatDateParam(range.end),
    });
  }

  onSearch(term: string): void {
    this.tableState.onSearch(term);
  }

  onPageChange(page: number): void {
    this.tableState.onPageChange(page);
  }

  onPageSizeChange(size: number): void {
    this.tableState.onPageSizeChange(size);
  }

  descargarExcel(): void {
    this.exportService
      .descargar(
        'excel',
        'Reporte de celo general',
        this.exportColumns,
        this.normalizedData(),
        'reporte-celo-general.xlsx',
      )
      .subscribe();
  }

  descargarPdf(): void {
    this.exportService
      .descargar(
        'pdf',
        'Reporte de celo general',
        this.exportColumns,
        this.normalizedData(),
        'reporte-celo-general.pdf',
      )
      .subscribe();
  }

  private formatDateParam(date: Date | null): string | undefined {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
