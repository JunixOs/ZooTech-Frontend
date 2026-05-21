import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ColumnConfig, ColumnFilterEvent } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { Vacuno } from '../../domain/models/vacuno.model';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';

@Component({
  selector: 'zt-vacunos-list',
  standalone: true,
  imports: [
    DataTableComponent,
    DateRangeFilterComponent
  ],
  templateUrl: './vacunos-list.component.html',
  styleUrl: './vacunos-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosListComponent {
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

  columns: ColumnConfig[] = [
    { key: 'codigo', headerKey: 'Código', filterable: false, align: 'left' },
    { key: 'fechaRegistro', headerKey: 'Fecha', filterable: false, align: 'center' },
    { key: 'nombre', headerKey: 'Nombre', filterable: false, align: 'left' },
    { key: 'raza', headerKey: 'Raza', filterable: false, align: 'left' },
    { key: 'procedencia', headerKey: 'Procedencia', filterable: false, align: 'left' },
    { 
      key: 'estado', 
      headerKey: 'Estado', 
      filterable: true, 
      filterType: 'toggle',
      filterOptions: [
        { label: 'Vivos', value: 'vivo' },
        { label: 'Muertos', value: 'muerto' }
      ],
      type: 'badge',
      align: 'center' 
    }
  ];

  onRowAction(row: Record<string, unknown>) {
    this.viewAction.emit(row);
  }
}
