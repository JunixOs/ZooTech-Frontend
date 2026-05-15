import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { CeloRegistro } from '@modules/reproduccion/celo/domain/models/celo.model';

/** Datos mock para desarrollo */
const MOCK_DATA: CeloRegistro[] = [
  {
    codigoRegistro: 'CEL-001',
    fecha: '2026-05-10',
    hora: '08:30',
    codigoVacuno: 'VAC-005',
    nombreVacuno: 'Luna',
    vecesEnCelo: 3,
  },
  {
    codigoRegistro: 'CEL-002',
    fecha: '2026-05-11',
    hora: '14:15',
    codigoVacuno: 'VAC-008',
    nombreVacuno: 'Estrella',
    vecesEnCelo: 1,
  },
  {
    codigoRegistro: 'CEL-003',
    fecha: '2026-05-12',
    hora: '06:45',
    codigoVacuno: 'VAC-005',
    nombreVacuno: 'Luna',
    vecesEnCelo: 4,
  },
  {
    codigoRegistro: 'CEL-004',
    fecha: '2026-05-12',
    hora: '10:00',
    codigoVacuno: 'VAC-012',
    nombreVacuno: 'Margarita',
    vecesEnCelo: 2,
  },
  {
    codigoRegistro: 'CEL-005',
    fecha: '2026-05-13',
    hora: '16:20',
    codigoVacuno: 'VAC-003',
    nombreVacuno: 'Rosa',
    vecesEnCelo: 5,
  },
  {
    codigoRegistro: 'CEL-006',
    fecha: '2026-05-13',
    hora: '07:10',
    codigoVacuno: 'VAC-008',
    nombreVacuno: 'Estrella',
    vecesEnCelo: 2,
  },
  {
    codigoRegistro: 'CEL-007',
    fecha: '2026-04-28',
    hora: '11:00',
    codigoVacuno: 'VAC-015',
    nombreVacuno: 'Clavel',
    vecesEnCelo: 1,
  },
  {
    codigoRegistro: 'CEL-008',
    fecha: '2026-05-01',
    hora: '09:30',
    codigoVacuno: 'VAC-005',
    nombreVacuno: 'Luna',
    vecesEnCelo: 2,
  },
  {
    codigoRegistro: 'CEL-009',
    fecha: '2026-05-05',
    hora: '15:45',
    codigoVacuno: 'VAC-020',
    nombreVacuno: 'Azucena',
    vecesEnCelo: 1,
  },
  {
    codigoRegistro: 'CEL-010',
    fecha: '2026-05-14',
    hora: '08:00',
    codigoVacuno: 'VAC-012',
    nombreVacuno: 'Margarita',
    vecesEnCelo: 3,
  },
  {
    codigoRegistro: 'CEL-011',
    fecha: '2026-05-08',
    hora: '13:20',
    codigoVacuno: 'VAC-003',
    nombreVacuno: 'Rosa',
    vecesEnCelo: 4,
  },
  {
    codigoRegistro: 'CEL-012',
    fecha: '2026-05-09',
    hora: '17:00',
    codigoVacuno: 'VAC-025',
    nombreVacuno: 'Jazmín',
    vecesEnCelo: 1,
  },
];

@Component({
  selector: 'zt-celo-container',
  standalone: true,
  imports: [DateRangeFilterComponent, SearchInputComponent, DataTableComponent, TranslatePipe],
  templateUrl: './celo-container.component.html',
  styleUrl: './celo-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CeloContainerComponent {
  /** Columna de la tabla */
  columns: ColumnConfig[] = [
    {
      key: 'codigoRegistro',
      headerKey: 'reproduccion.celo.columns.codigoRegistro',
      sortable: true,
      filterable: true,
    },
    {
      key: 'fecha',
      headerKey: 'reproduccion.celo.columns.fecha',
      sortable: true,
      filterable: true,
    },
    { key: 'hora', headerKey: 'reproduccion.celo.columns.hora', sortable: true, filterable: true },
    {
      key: 'codigoVacuno',
      headerKey: 'reproduccion.celo.columns.codigoVacuno',
      sortable: true,
      filterable: true,
    },
    {
      key: 'nombreVacuno',
      headerKey: 'reproduccion.celo.columns.nombreVacuno',
      sortable: true,
      filterable: true,
    },
    {
      key: 'vecesEnCelo',
      headerKey: 'reproduccion.celo.columns.vecesEnCelo',
      sortable: true,
      filterable: false,
      align: 'center',
    },
  ];

  /** Datos completos (sin filtrar) */
  private allData = signal<CeloRegistro[]>(MOCK_DATA);

  /** Filtro de rango de fechas */
  private dateRange = signal<DateRange>({ start: null, end: null });

  /** Texto de búsqueda global */
  private searchTerm = signal('');

  /** Página actual */
  currentPage = signal(1);
  /** Tamaño de página */
  pageSize = signal(10);

  /** Datos filtrados por fecha y búsqueda */
  filteredData = computed(() => {
    let data = this.allData();
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

  /** Manejar clic en botón "Ver" de una fila */
  onViewRow(_row: Record<string, unknown>): void {
    // TODO: navegar al detalle/edición
  }
}
