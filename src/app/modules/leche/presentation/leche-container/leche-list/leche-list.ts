import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-leche-list',
  standalone: true,
  imports: [TranslatePipe, DataTableComponent, SearchInputComponent, DateRangeFilterComponent],
  templateUrl: './leche-list.html',
  styleUrl: './leche-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheList {
  columns = signal<ColumnConfig[]>([
    { key: 'fecha', headerKey: 'leche.table.fecha' },
    { key: 'vaca', headerKey: 'leche.table.vaca' },
    { key: 'cantidad', headerKey: 'leche.table.cantidad' },
    { key: 'turno', headerKey: 'leche.table.turno' },
  ]);

  data = signal<Record<string, unknown>[]>([
    { id: 1, fecha: '2023-10-01', vaca: 'Vaca Lola', cantidad: 15, turno: 'Mañana' },
    { id: 2, fecha: '2023-10-01', vaca: 'Vaca Pinta', cantidad: 12, turno: 'Mañana' },
    { id: 3, fecha: '2023-10-01', vaca: 'Vaca Lola', cantidad: 14, turno: 'Tarde' },
  ]);

  loading = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = computed(() => this.data().length);

  onSearch(term: string) {
    console.log('Search:', term);
  }

  onDateRangeChange(range: DateRange) {
    console.log('Date range:', range);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onRowAction(row: Record<string, unknown>) {
    console.log('Action on row:', row);
  }
}
