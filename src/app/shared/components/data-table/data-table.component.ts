import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ColumnConfig,
  ColumnFilterEvent,
  RowActionConfig,
  RowActionEvent,
} from '@shared/models/table-config.model';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';

@Component({
  selector: 'zt-data-table',
  standalone: true,
  imports: [TranslatePipe, PaginatorComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent implements OnDestroy {
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
  /** Clase de ícono FontAwesome para el botón de acción */
  actionIcon = input<string>('fa-solid fa-magnifying-glass-plus');
  /** Valor inicial de búsqueda global, útil para restaurar estado desde la URL */
  initialSearch = input<string>('');
  /** Filtros iniciales por columna, útiles para restaurar estado desde la URL */
  initialColumnFilters = input<Record<string, string>>({});
  /** Habilita búsqueda server-side mientras el usuario escribe. */
  searchOnInput = input(false);
  /** Tiempo de espera para búsqueda server-side por escritura. */
  searchDebounceMs = input(350);

  /** Emite al hacer clic en el botón de acción de una fila */
  rowAction = output<Record<string, unknown>>();
  /** Emite al cambiar de página */
  pageChange = output<number>();
  /** Emite al cambiar tamaño de página */
  pageSizeChange = output<number>();
  /** Emite al realizar búsqueda global */
  search = output<string>();
  rowActions = input<RowActionConfig[]>([]);
  rowActionSelected = output<RowActionEvent>();
  
  /** Emite al cambiar filtros por columna */
  columnFilter = output<Record<string, string>>();
  /** Emite el filtro individual para consumidores que gestionan su propio estado */
  columnFilterChange = output<ColumnFilterEvent>();
  private searchDebounceId: ReturnType<typeof setTimeout> | null = null;

  startItem = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  /** Filtros por columna (key → value) */
  columnFilters = signal<Record<string, string>>({});

  /** Valor de búsqueda global */
  searchValue = signal('');

  constructor() {
    effect(() => {
      this.searchValue.set(this.initialSearch());
      this.columnFilters.set(this.initialColumnFilters());
    });
  }

  ngOnDestroy(): void {
    this.clearPendingSearch();
  }

  hasFilterableColumns = computed(() => this.columns().some((c) => c.filterable));

  onRowAction(actionKey: string, row: Record<string, unknown>): void {
    this.rowActionSelected.emit({ actionKey, row });
  }

  onColumnFilter(key: string, value: string): void {
    this.columnFilters.update((f) => {
      const next = { ...f };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
    this.columnFilter.emit(this.columnFilters());
    this.columnFilterChange.emit({ columnKey: key, value });
  }

  onSearchInput(value: string): void {
    this.searchValue.set(value);

    if (!this.searchOnInput()) {
      return;
    }

    this.clearPendingSearch();
    this.searchDebounceId = setTimeout(() => {
      this.searchDebounceId = null;
      this.search.emit(this.searchValue());
    }, this.searchDebounceMs());
  }

  onSearchSubmit(): void {
    this.clearPendingSearch();
    this.search.emit(this.searchValue());
  }

  onClearSearch(inputEl: HTMLInputElement): void {
    this.clearPendingSearch();
    inputEl.value = '';
    this.searchValue.set('');
    this.search.emit('');
  }

  getCellValue(row: Record<string, unknown>, key: string): string {
    const value = row[key];
    if (value === null || value === undefined) return '—';
    return String(value);
  }

  private clearPendingSearch(): void {
    if (this.searchDebounceId === null) return;
    clearTimeout(this.searchDebounceId);
    this.searchDebounceId = null;
  }
}
