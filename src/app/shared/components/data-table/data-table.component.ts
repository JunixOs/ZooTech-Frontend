import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ColumnConfig, ColumnFilterEvent } from '@shared/models/table-config.model';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';

@Component({
  selector: 'zt-data-table',
  standalone: true,
  imports: [TranslatePipe, PaginatorComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  /** Configuración de columnas */
  columns = input.required<ColumnConfig[]>();
  /** Datos a mostrar (página actual ya filtrada) */
  data = input.required<Record<string, unknown>[]>();
  /** Estado de carga */
  loading = input(false);
  /** Página actual */
  currentPage = input.required<number>();
  /** Tamaño de página */
  pageSize = input.required<number>();
  /** Total de registros (sin paginar) */
  totalItems = input.required<number>();
  /** Clave i18n para el botón de acción (ej: 'shared.table.view') */
  actionLabel = input<string>('');

  /** Emite al hacer clic en el botón de acción de una fila */
  rowAction = output<Record<string, unknown>>();
  /** Emite al cambiar de página */
  pageChange = output<number>();
  /** Emite al cambiar tamaño de página */
  pageSizeChange = output<number>();
  /** Emite al realizar búsqueda global */
  search = output<string>();
  /** Emite al filtrar en una columna específica */
  columnFilterChange = output<ColumnFilterEvent>();

  startItem = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  /** Filtros por columna (key → value) */
  columnFilters = signal<Record<string, string>>({});

  onColumnFilter(key: string, value: string): void {
    this.columnFilters.update((f) => ({ ...f, [key]: value }));
    this.columnFilterChange.emit({ columnKey: key, value });
  }

  getCellValue(row: Record<string, unknown>, key: string): string {
    const value = row[key];
    if (value === null || value === undefined) return '—';
    return String(value);
  }
}
