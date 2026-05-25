import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { CeloRegistro } from '@modules/reproduccion/celo/domain/models/celo.model';
import { CeloApiService } from '@modules/reproduccion/celo/infrastructure/celo-api.service';

// ---------------------------------------------------------------------------
// Datos mock para desarrollo — se muestran mientras el backend no responde.
// Cuando el endpoint devuelva datos exitosamente, estos se reemplazan.
// TODO: eliminar cuando el backend esté estable.
// ---------------------------------------------------------------------------
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
<<<<<<< HEAD
  imports: [DateRangeFilterComponent, DataTableComponent, TranslatePipe],
=======
  imports: [DateRangeFilterComponent, DataTableComponent, TranslatePipe, RouterLink],
>>>>>>> develop
  templateUrl: './celo-container.component.html',
  styleUrl: './celo-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CeloContainerComponent implements OnInit {
  /* ------------------------------------------------------------------ */
  /*  Dependencias                                                      */
  /* ------------------------------------------------------------------ */
  private readonly celoApiService = inject(CeloApiService);
  private readonly destroyRef = inject(DestroyRef);

  /* ------------------------------------------------------------------ */
  /*  Estado                                                             */
  /* ------------------------------------------------------------------ */
  /** Datos completos (sin filtrar) — inicia con MOCK_DATA para dev local */
  private readonly allData = signal<CeloRegistro[]>(MOCK_DATA);

  /** Indica si la petición al backend está en curso */
  readonly isLoading = signal(true);

  /** Mensaje de error si la petición falló (null = sin error) */
  readonly error = signal<string | null>(null);

  /** Filtro de rango de fechas activo */
  private readonly dateRange = signal<DateRange>({ start: null, end: null });

  /** Filtro de rango de fechas temporal (se aplica al hacer clic en buscar) */
  private readonly tempDateRange = signal<DateRange>({ start: null, end: null });

  /** Texto de búsqueda global */
  readonly searchTerm = signal('');

  /** Filtros de columna activos */
  readonly columnFilters = signal<Record<string, string>>({});

  /** Página actual */
  readonly currentPage = signal(1);

  /** Tamaño de página */
  readonly pageSize = signal(10);

  /* ------------------------------------------------------------------ */
  /*  Configuración de columnas                                         */
  /* ------------------------------------------------------------------ */
  readonly columns: ColumnConfig[] = [
    {
      key: 'codigoRegistro',
      headerKey: 'reproduccion.celo.columns.codigoRegistro',
      sortable: true,
      filterable: true,
      width: '120px',
    },
    {
      key: 'fecha',
      headerKey: 'reproduccion.celo.columns.fecha',
      sortable: true,
      filterable: true,
      width: '120px',
    },
    {
      key: 'hora',
      headerKey: 'reproduccion.celo.columns.hora',
      sortable: true,
      filterable: true,
      width: '100px',
    },
    {
      key: 'codigoVacuno',
      headerKey: 'reproduccion.celo.columns.codigo',
      sortable: true,
      filterable: true,
      width: '120px',
    },
    {
      key: 'nombreVacuno',
      headerKey: 'reproduccion.celo.columns.nombre',
      sortable: true,
      filterable: true,
      width: 'auto',
    },
    {
      key: 'vecesEnCelo',
      headerKey: 'reproduccion.celo.columns.vecesEnCelo',
      sortable: true,
      filterable: false,
      align: 'center',
      width: '130px',
    },
  ];

  /* ------------------------------------------------------------------ */
  /*  Computed — datos derivados                                        */
  /* ------------------------------------------------------------------ */

<<<<<<< HEAD
  /** Filtro de rango de fechas */
  private dateRange = signal<DateRange>({ start: null, end: null });

  /** Texto de búsqueda global */
  searchTerm = signal('');

  /** Página actual */
  currentPage = signal(1);
  /** Tamaño de página */
  pageSize = signal(10);

  /** Datos filtrados por fecha y búsqueda */
  filteredData = computed(() => {
=======
  /** Datos filtrados por fecha, búsqueda y columnas */
  readonly filteredData = computed(() => {
>>>>>>> develop
    let data = this.allData();
    const range = this.dateRange();
    const term = this.searchTerm().toLowerCase().trim();
    const colFilters = this.columnFilters();

    // 1. Filtrar por rango de fechas
    if (range.start) {
      const start = new Date(range.start);
      data = data.filter((r) => new Date(r.fecha) >= start);
    }
    if (range.end) {
      const end = new Date(range.end);
      end.setHours(23, 59, 59, 999);
      data = data.filter((r) => new Date(r.fecha) <= end);
    }

    // 2. Filtrar por búsqueda global
    if (term) {
      data = data.filter(
        (r) =>
          r.codigoRegistro.toLowerCase().includes(term) ||
          r.codigoVacuno.toLowerCase().includes(term) ||
          r.nombreVacuno.toLowerCase().includes(term),
      );
    }

    // 3. Filtrar por filtros de columna individuales
    for (const [key, val] of Object.entries(colFilters)) {
      if (!val) continue;
      const colTerm = val.toLowerCase().trim();
      data = data.filter((r) => {
        const cellValue = String(r[key as keyof CeloRegistro] ?? '').toLowerCase();
        return cellValue.includes(colTerm);
      });
    }

    return data;
  });

  /** Total de registros filtrados */
  readonly totalItems = computed(() => this.filteredData().length);

  /**
   * Versión plana de los datos paginados para el DataTableComponent.
   *
   * Se usa `map()` explícito en vez de `as unknown as` para que TypeScript
   * verifique que cada elemento es realmente un objeto CeloRegistro.
   */
  readonly paginatedData = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredData()
      .slice(start, start + this.pageSize())
      .map((item): Record<string, unknown> => ({ ...item }));
  });

  /* ------------------------------------------------------------------ */
  /*  Ciclo de vida                                                     */
  /* ------------------------------------------------------------------ */

  ngOnInit(): void {
    this.cargarRegistros();
  }

  /** Intenta obtener los registros desde el backend. Si falla, conserva MOCK_DATA. */
  private cargarRegistros(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.celoApiService
      .listarCelos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.allData.set(data);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          console.error('[CeloContainer] Error al cargar registros:', err.message);
          this.error.set(err.message);
          this.isLoading.set(false);
          // allData conserva MOCK_DATA — la UI sigue funcionando
        },
      });
  }

  /* ------------------------------------------------------------------ */
  /*  Handlers de UI                                                    */
  /* ------------------------------------------------------------------ */

  onColumnFilter(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
    this.currentPage.set(1);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onDateRangeChange(range: DateRange): void {
    this.tempDateRange.set(range);
    if (range.start === null && range.end === null) {
      this.dateRange.set(range);
      this.currentPage.set(1);
    }
  }

  onApplyFilters(): void {
    this.dateRange.set(this.tempDateRange());
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onViewRow(_row: Record<string, unknown>): void {
    // TODO: navegar al detalle/edición
  }
}
