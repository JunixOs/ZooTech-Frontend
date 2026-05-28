import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';
import { LecheForm } from './leche-form/leche-form';
import { LecheDetail } from './leche-detail/leche-detail';

@Component({
  selector: 'zt-leche-container',
  standalone: true,
  imports: [
    CommonModule,
    DateRangeFilterComponent,
    DataTableComponent,
    TranslatePipe,
    LecheForm,
    LecheDetail
  ],
  templateUrl: './leche-container.html',
  styleUrl: './leche-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheContainer implements OnInit {
  private readonly facade = inject(LecheFacade);

  /** Datos de la fachada */
  registros = this.facade.registros;
  loading = this.facade.loading;

  /** Configuración de columnas */
  columns: ColumnConfig[] = [
    {
      key: 'codigoRegistro',
      headerKey: 'leche.table.codigo',
      sortable: true,
      filterable: true,
      width: '120px',
    },
    {
      key: 'fecha',
      headerKey: 'leche.table.fecha',
      sortable: true,
      filterable: true,
      width: '120px',
    },
    {
      key: 'hora',
      headerKey: 'leche.table.hora',
      sortable: true,
      filterable: true,
      width: '100px',
    },
    {
      key: 'nombreVacuno',
      headerKey: 'leche.table.vaca',
      sortable: true,
      filterable: true,
      width: 'auto',
    },
    {
      key: 'litros',
      headerKey: 'leche.table.litro',
      sortable: true,
      filterable: false,
      align: 'center',
      width: '130px',
    },
  ];

  /** Estado de filtros y paginación */
  searchTerm = signal('');
  dateRange = signal<DateRange>({ start: null, end: null });
  currentPage = signal(1);
  pageSize = signal(10);

  /** Estado de modales */
  showFormModal = signal(false);
  showDetailModal = signal(false);
  selectedId = signal<number | null>(null);

  /** Datos filtrados por fecha y búsqueda */
  filteredData = computed(() => {
    let data = this.registros();
    const range = this.dateRange();
    const term = this.searchTerm().toLowerCase().trim();

    // Filtrar por rango de fechas
    if (range.start) {
      const start = new Date(range.start);
      data = data.filter((r) => new Date(r.fecha) >= start);
    }
    if (range.end) {
      const end = new Date(range.end);
      end.setHours(23, 59, 59, 999);
      data = data.filter((r) => new Date(r.fecha) <= end);
    }

    // Filtrar por búsqueda global
    if (term) {
      data = data.filter(
        (r) =>
          r.codigoRegistro.toLowerCase().includes(term) ||
          r.codigoVacuno.toLowerCase().includes(term) ||
          r.nombreVacuno.toLowerCase().includes(term),
      );
    }

    return data;
  });

  /** Total de registros filtrados */
  totalItems = computed(() => this.filteredData().length);

  /** Datos paginados para la tabla */
  paginatedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredData().slice(start, start + this.pageSize()) as unknown as Record<
      string,
      unknown
    >[];
  });

  ngOnInit(): void {
    this.facade.cargarRegistros();
  }

  /** Manejar búsqueda global */
  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  /** Manejar cambio de rango de fechas */
  onDateRangeChange(range: DateRange): void {
    this.dateRange.set(range);
    this.currentPage.set(1);
  }

  /** Manejar cambio de página */
  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  /** Manejar cambio de tamaño de página */
  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  /** Modales */
  openForm(): void {
    this.showFormModal.set(true);
  }

  closeForm(): void {
    this.showFormModal.set(false);
  }

  onFormSave(): void {
    this.showFormModal.set(false);
  }

  onViewRow(row: Record<string, unknown>): void {
    const id = row['id'] as number | undefined;
    if (!id) return;
    this.selectedId.set(id);
    this.showDetailModal.set(true);
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
    this.selectedId.set(null);
  }
}
