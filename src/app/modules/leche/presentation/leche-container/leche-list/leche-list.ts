import { ChangeDetectionStrategy, Component, signal, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { LecheForm } from '../leche-form/leche-form';
import { LecheRegistro } from '@modules/leche/domain/models/leche.model';

@Component({
  selector: 'zt-leche-list',
  standalone: true,
  imports: [TranslatePipe, CommonModule, DataTableComponent, DateRangeFilterComponent, LecheForm],
  templateUrl: './leche-list.html',
  styleUrl: './leche-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheList {
  // Component Inputs
  data = input.required<LecheRegistro[]>();
  loading = input<boolean>(false);

  // Internal Signals
  searchTerm = signal('');
  dateRange = signal<DateRange>({ start: null, end: null });
  currentPage = signal(1);
  pageSize = signal(10);
  showFormModal = signal(false);

  columns = signal<ColumnConfig[]>([
    { key: 'fecha', headerKey: 'leche.table.fecha' },
    { key: 'hora', headerKey: 'leche.table.hora' },
    { key: 'nombreVacuno', headerKey: 'leche.table.vaca' },
    { key: 'codigoRegistro', headerKey: 'leche.table.codigo' },
    { key: 'litros', headerKey: 'leche.table.litro' },
  ]);

  // Computed Properties
  totalItems = computed(() => this.data().length);

  showingFrom = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  showingTo = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  // Methods
  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onDateRangeChange(range: DateRange): void {
    this.dateRange.set(range);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onViewRow(row: Record<string, unknown>): void {
    const selectedVaca = row['vaca'] as string;
    console.log('Navigate to detail for vacuno:', selectedVaca);
  }

  openModal(): void {
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
  }

  onFormSave(newRecord: any): void {
    console.log('Nuevo registro guardado:', newRecord);
    this.showFormModal.set(false);
  }
}
