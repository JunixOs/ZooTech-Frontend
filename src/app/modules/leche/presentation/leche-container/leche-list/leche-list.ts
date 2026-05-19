import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { LecheForm } from '../leche-form/leche-form';

@Component({
  selector: 'zt-leche-list',
  standalone: true,
  imports: [
    TranslatePipe,
    CommonModule,
    DataTableComponent,
    SearchInputComponent,
    DateRangeFilterComponent,
    PaginatorComponent,
    LecheForm,
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
  showFormModal = signal(false);
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

  openModal(): void {
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
  }

  onFormSave(newRecord: any): void {
    const record = {
      id: Math.max(...this.data().map((r) => (r['id'] as number) || 0), 0) + 1,
      fecha: newRecord.fecha,
      hora: newRecord.hora,
      vaca: newRecord.vaca,
      litro: newRecord.litro,
      codigo: newRecord.codigo,
    };

    this.data.update((current) => [...current, record]);
    this.showFormModal.set(false);
    console.log('Nuevo registro guardado:', record);
  }
}
