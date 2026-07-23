import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ColumnConfig, ColumnFilterEvent } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { Vacuno } from '../../../domain/models/vacuno.model';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button';

@Component({
  selector: 'zt-vacunos-list',
  standalone: true,
  imports: [DataTableComponent, DateRangeFilterComponent, TranslatePipe, PageHeaderComponent, DownloadButtonComponent],
  templateUrl: './vacunos-list.html',
  styleUrl: './vacunos-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosList {
  vacunos = input.required<Vacuno[]>();
  loading = input.required<boolean>();
  error = input<string | null>(null);
  currentPage = input.required<number>();
  pageSize = input.required<number>();
  totalItems = input.required<number>();

  search = output<string>();
  filterState = output<ColumnFilterEvent>();
  dateRangeChange = output<DateRange>();
  pageChange = output<number>();
  pageSizeChange = output<number>();
  viewAction = output<Record<string, unknown>>();
  download = output<'excel' | 'pdf'>();

  columns: ColumnConfig[] = [
    {
      key: 'codigo',
      headerKey: 'vacunos.listado.columns.codigo',
      filterable: false,
      align: 'left',
    },
    {
      key: 'fechaRegistro',
      headerKey: 'vacunos.listado.columns.fecha',
      filterable: false,
      type: 'date',
      align: 'center',
    },
    {
      key: 'nombre',
      headerKey: 'vacunos.listado.columns.nombre',
      filterable: false,
      align: 'left',
    },
    { key: 'raza', headerKey: 'vacunos.listado.columns.raza', filterable: false, align: 'left' },
    {
      key: 'procedencia',
      headerKey: 'vacunos.listado.columns.procedencia',
      filterable: false,
      align: 'left',
    },
    {
      key: 'estado',
      headerKey: 'vacunos.listado.columns.estado',
      filterable: true,
      filterType: 'toggle',
      filterOptions: [
        { label: 'vacunos.listado.filters.activos', value: 'vivo' },
        { label: 'vacunos.listado.filters.eliminados', value: 'muerto' },
      ],
      type: 'badge',
      translatePrefix: 'vacunos.status',
      align: 'center',
    },
  ];

  onRowAction(row: Record<string, unknown>) {
    this.viewAction.emit(row);
  }
}
