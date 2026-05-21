type LecheRow = {
  id: number;
  fecha: string;
  hora: string;
  vaca: string;
  litro: number;
  codigo: string;
};

import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { LecheForm } from '../leche-form/leche-form';

@Component({
  selector: 'zt-leche-list',
  standalone: true,
  imports: [
    TranslatePipe,
    CommonModule,
    DataTableComponent,
    DateRangeFilterComponent,
    LecheForm,
  ],
  templateUrl: './leche-list.html',
  styleUrl: './leche-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheList {
  searchTerm = signal('');
  dateRange = signal<DateRange>({ start: null, end: null });
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

  data = signal<LecheRow[]>([
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
  filteredData = computed(() => {
    let data = [...this.data()];
    const range = this.dateRange();
    const term = this.searchTerm().toLowerCase().trim();

    if (range.start) {
      const start = new Date(range.start);
      start.setHours(0, 0, 0, 0);
      data = data.filter((r) => new Date(r.fecha) >= start);
    }

    if (range.end) {
      const end = new Date(range.end);
      end.setHours(23, 59, 59, 999);
      data = data.filter((r) => new Date(r.fecha) <= end);
    }

    if (term) {
      data = data.filter(
        (r) =>
          r.vaca.toLowerCase().includes(term) ||
          r.codigo.toLowerCase().includes(term) ||
          String(r.litro).toLowerCase().includes(term),
      );
    }

    return data;
  });
  paginatedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredData().slice(start, start + this.pageSize());
  });
  searchButton = signal('Buscar');

  showingFrom = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  showingTo = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  onSearch(term: string): void {
    this.searchTerm.set(term);
    console.log('Search:', term);
    this.currentPage.set(1);
  }

  onAdd(): void {
    // TODO: navegar al formulario de registro
  }

  onDateRangeChange(range: DateRange): void {
    this.dateRange.set(range);
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

  onViewRow(row: Record<string, unknown>): void {
    const selectedVaca = row['vaca'] as string;
    // Buscar el ID del vacuno por nombre
    const vacunoId = 1; // Por ahora hardcodeado, en producción vendría del backend
    console.log('Navigate to detail for vacuno:', selectedVaca, 'ID:', vacunoId);
    // Aquí irías a: this.router.navigate(['/leche/registro/detalle', vacunoId]);
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
