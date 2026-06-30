import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ColumnConfig,
  ColumnFilterEvent,
  RowActionConfig,
  RowActionEvent,
} from '@shared/models/table-config.model';
import { Vacuno } from '../../domain/models/vacuno.model';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';

@Component({
  selector: 'zt-vacunos-list',
  standalone: true,
  imports: [DataTableComponent, FormsModule, TranslatePipe, PageHeaderComponent],
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
  fechaDesde = input.required<string>();
  fechaHasta = input.required<string>();

  search = output<string>();
  filterState = output<ColumnFilterEvent>();
  fechaDesdeChange = output<string>();
  fechaHastaChange = output<string>();
  filterSearch = output<void>();
  filterClear = output<void>();
  pageChange = output<number>();
  pageSizeChange = output<number>();
  editAction = output<Record<string, unknown>>();

  columns: ColumnConfig[] = [
    {
      key: 'codigo',
      headerKey: 'vacunos.listado.columns.codigo',
      filterable: false,
      align: 'left',
    },
    {
      key: 'fechaRegistroFuncion',
      headerKey: 'vacunos.listado.columns.fecha',
      filterable: false,
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
        { label: 'vacunos.listado.filters.activos', value: 'activo' },
        { label: 'vacunos.listado.filters.eliminados', value: 'eliminado' },
      ],
      type: 'badge',
      align: 'center',
    },
  ];

  rowActions: RowActionConfig[] = [
    {
      key: 'edit',
      labelKey: 'vacunos.detail.actions.editar',
      icon: 'fa-solid fa-pen-to-square',
    },
  ];

  onRowActionSelected(event: RowActionEvent): void {
    if (event.actionKey === 'edit') {
      this.editAction.emit(event.row);
    }
  }
}
