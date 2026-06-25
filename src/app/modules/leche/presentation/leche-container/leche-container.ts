import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';
import { AuthService } from '@core/auth/auth.service';
import { LecheForm } from './leche-form/leche-form';
import { LecheDetail } from './leche-detail/leche-detail';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { createTableFilterState } from '@shared/utils/table-filter-state';

@Component({
  selector: 'zt-leche-container',
  standalone: true,
  imports: [
    DateRangeFilterComponent,
    DataTableComponent,
    TranslatePipe,
    LecheForm,
    LecheDetail,
    PageHeaderComponent,
  ],
  templateUrl: './leche-container.html',
  styleUrl: './leche-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheContainer implements OnInit {
  private readonly facade = inject(LecheFacade);
  private readonly authService = inject(AuthService);

  /** Datos de la fachada */
  registros = this.facade.registros;
  vacunos = this.facade.vacunos;

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
    {
      key: 'encargado',
      headerKey: 'leche.table.encargado',
      sortable: true,
      filterable: true,
      width: 'auto',
    },
  ];

  private readonly tableFilters = createTableFilterState(() => this.filteredData());
  readonly searchTerm = this.tableFilters.searchTerm;
  readonly dateRange = this.tableFilters.dateRange;
  readonly currentPage = this.tableFilters.currentPage;
  readonly pageSize = this.tableFilters.pageSize;
  readonly totalItems = this.tableFilters.totalItems;
  readonly paginatedData = this.tableFilters.paginatedData;

  /** Estado de modales */
  showFormModal = signal(false);
  showDetailModal = signal(false);

  protected readonly encargadoUsuarioId = this.authService.userId;
  protected readonly encargadoNombre = this.authService.userName;
  selectedId = signal<number | null>(null);

  private parseDisplayDate(fechaStr: string): Date {
    const [day, month, year] = fechaStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  /** Datos filtrados por fecha y búsqueda */
  filteredData = computed(() => {
    let data = this.registros();
    const range = this.dateRange();
    const term = this.searchTerm().toLowerCase().trim();

    if (range.start) {
      const start = new Date(range.start);
      data = data.filter((r) => this.parseDisplayDate(r.fecha) >= start);
    }
    if (range.end) {
      const end = new Date(range.end);
      end.setHours(23, 59, 59, 999);
      data = data.filter((r) => this.parseDisplayDate(r.fecha) <= end);
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

  ngOnInit(): void {
    this.facade.cargarRegistros();
  }

  /** Manejar búsqueda global */
  onSearch(term: string): void {
    this.tableFilters.onSearch(term);
  }

  /** Manejar cambio de rango de fechas */
  onDateRangeChange(range: DateRange): void {
    this.tableFilters.onDateRangeChange(range);
  }

  /** Manejar cambio de página */
  onPageChange(page: number): void {
    this.tableFilters.onPageChange(page);
  }

  /** Manejar cambio de tamaño de página */
  onPageSizeChange(size: number): void {
    this.tableFilters.onPageSizeChange(size);
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
    this.facade.cargarRegistros();
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
