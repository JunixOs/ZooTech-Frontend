import { ChangeDetectionStrategy, Component, OnDestroy, computed, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ColumnConfig, ColumnFilterEvent } from '@shared/models/table-config.model';
import { DatePipe } from '@angular/common';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';

@Component({
  selector: 'zt-data-table',
  standalone: true,
  imports: [TranslatePipe, PaginatorComponent, DatePipe],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent implements OnDestroy {
  private searchDebounceId: ReturnType<typeof setTimeout> | null = null;

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

  /** Emite al hacer clic en el botón de acción de una fila */
  rowAction = output<Record<string, unknown>>();
  /** Emite al cambiar de página */
  pageChange = output<number>();
  /** Emite al cambiar tamaño de página */
  pageSizeChange = output<number>();
  /** Emite al realizar búsqueda global */
  search = output<string>();

  /** Emite al cambiar filtros por columna */
  columnFilter = output<Record<string, string>>();
  /** Emite el filtro individual para consumidores que gestionan su propio estado */
  columnFilterChange = output<ColumnFilterEvent>();

  startItem = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  /** Filtros por columna (key → value) */
  columnFilters = signal<Record<string, string>>({});

  /** Valor de búsqueda global */
  searchValue = signal('');

  hasFilterableColumns = computed(() => this.columns().some((c) => c.filterable));

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
    this.clearSearchDebounce();
    this.searchDebounceId = setTimeout(() => {
      this.search.emit(this.searchValue());
      this.searchDebounceId = null;
    }, 300);
  }

  onSearchSubmit(): void {
    this.clearSearchDebounce();
    this.search.emit(this.searchValue());
  }

  onClearSearch(inputEl: HTMLInputElement): void {
    this.clearSearchDebounce();
    inputEl.value = '';
    this.searchValue.set('');
    this.search.emit('');
  }

  ngOnDestroy(): void {
    this.clearSearchDebounce();
  }

  private clearSearchDebounce(): void {
    if (this.searchDebounceId) {
      clearTimeout(this.searchDebounceId);
      this.searchDebounceId = null;
    }
  }

  getCellValue(row: Record<string, unknown>, key: string): string {
    const value = row[key];
    if (value === null || value === undefined) return '—';
    return String(value);
  }

  getDisplayValue(row: Record<string, unknown>, col: ColumnConfig): string {
    const value = this.getCellValue(row, col.key);
    return col.translatePrefix ? `${col.translatePrefix}.${value}` : value;
  }
}
