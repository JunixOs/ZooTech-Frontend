import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ColumnConfig, ColumnFilterEvent } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { FecundacionRegistro } from '../../domain/models/fecundacion.model';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button';

@Component({
  selector: 'zt-fecundacion-list',
  standalone: true,
  imports: [DataTableComponent, DateRangeFilterComponent, TranslatePipe, PageHeaderComponent, RouterLink, DownloadButtonComponent],
  templateUrl: './fecundacion-list.html',
  styleUrl: './fecundacion-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionList {
  fecundaciones = input.required<FecundacionRegistro[]>();
  loading = input.required<boolean>();
  error = input<string | null>(null);
  currentPage = input.required<number>();
  pageSize = input.required<number>();
  totalItems = input.required<number>();

  search = output<string>();
  filterResultado = output<ColumnFilterEvent>();
  dateRangeChange = output<DateRange>();
  pageChange = output<number>();
  pageSizeChange = output<number>();
  viewAction = output<Record<string, unknown>>();
  download = output<'excel' | 'pdf'>();

  columns: ColumnConfig[] = [
    { key: 'codigoFecundacion', headerKey: 'fecundacion.listado.columns.codigo', filterable: false, align: 'left' },
    { key: 'fechaProcedimiento', headerKey: 'fecundacion.listado.columns.fecha', filterable: false, type: 'date', align: 'center' },
    { key: 'nombreVacunoReceptor', headerKey: 'fecundacion.listado.columns.vacuno', filterable: false, align: 'left' },
    {
      key: 'tipoFecundacion',
      headerKey: 'fecundacion.listado.columns.tipo',
      filterable: false,
      translatePrefix: 'fecundacion.tipos',
      align: 'center',
    },
    { key: 'nombreDonante', headerKey: 'fecundacion.listado.columns.donante', filterable: false, align: 'left' },
    { key: 'responsable', headerKey: 'fecundacion.listado.columns.responsable', filterable: false, align: 'left' },
    {
      key: 'codigoResultado',
      headerKey: 'fecundacion.listado.columns.estado',
      filterable: true,
      filterType: 'toggle',
      filterOptions: [
        { label: 'fecundacion.estados.EXITOSO', value: 'EXITOSO' },
        { label: 'fecundacion.estados.PENDIENTE', value: 'PENDIENTE' },
        { label: 'fecundacion.estados.FALLIDO', value: 'FALLIDO' },
      ],
      type: 'badge',
      badgeColorMap: {
        'EXITOSO': 'badge-exitoso',
        'PENDIENTE': 'badge-pendiente',
        'FALLIDO': 'badge-fallido',
      },
      translatePrefix: 'fecundacion.estados',
      align: 'center',
    },
  ];

  onRowAction(row: Record<string, unknown>) {
    this.viewAction.emit(row);
  }
}
