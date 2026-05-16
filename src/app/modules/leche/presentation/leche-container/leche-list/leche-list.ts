import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';

@Component({
  selector: 'zt-leche-list',
  standalone: true,
  imports: [
    TranslatePipe,
    DataTableComponent,
    SearchInputComponent,
    DateRangeFilterComponent,
    PaginatorComponent,
  ],
  templateUrl: './leche-list.html',
  styleUrl: './leche-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheList {
  columns = signal<ColumnConfig[]>([
    {
      key: 'fecha',
      headerKey: 'leche.table.fecha',
    },
    { key: 'hora', headerKey: 'leche.table.hora' },
    { key: 'vaca', headerKey: 'leche.table.vaca' },
    { key: 'codigo', headerKey: 'leche.table.codigo' },
    { key: 'litro', headerKey: 'leche.table.litro' },
  ]);

  data = signal<Record<string, unknown>[]>([
    {
      id: 1,
      fecha: '2023-10-01',
      hora: '10:00',
      vaca: 'Vaca Lola',
      litro: 15,
      codigo: '',
    },
    {
      id: 2,
      fecha: '2023-10-01',
      hora: '11:00',
      vaca: 'Vaca Pinta',
      litro: 12,
      codigo: '',
    },
    {
      id: 3,
      fecha: '2023-10-01',
      hora: '12:00',
      vaca: 'Vaca Lola',
      litro: 14,
      codigo: '',
    },
  ]);

  loading = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = computed(() => this.data().length);
  searchButton = signal('Buscar');

  showingFrom = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  showingTo = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  onSearch(term: string): void {
    console.log('Search:', term);
    this.currentPage.set(1);
  }

  onDateRangeChange(range: DateRange): void {
    console.log('Date range:', range);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onRowAction(row: Record<string, unknown>): void {
    console.log('Action on row:', row);
  }
}
