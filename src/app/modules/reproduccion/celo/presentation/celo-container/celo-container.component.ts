import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { CeloRegistro } from '@modules/reproduccion/celo/domain/models/celo.model';
import { CeloApiService } from '@modules/reproduccion/celo/infrastructure/celo-api.service';

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
  imports: [CommonModule, FormsModule, DateRangeFilterComponent, DataTableComponent, TranslatePipe],
  templateUrl: './celo-container.component.html',
  styleUrl: './celo-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CeloContainerComponent implements OnInit {
  private celoApiService = inject(CeloApiService);
  /** Columna de la tabla */
  columns: ColumnConfig[] = [
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

  /** Datos completos (sin filtrar) */
  private allData = signal<CeloRegistro[]>([]);

  ngOnInit(): void {
    this.resetNuevoCelo();
    this.celoApiService.listarCelos().subscribe({
      next: (data) => this.allData.set(data),
      error: (err) => console.error('Error al cargar registros de celo:', err),
    });
  }

  /** Filtro de rango de fechas activo */
  private dateRange = signal<DateRange>({ start: null, end: null });

  /** Filtro de rango de fechas temporal */
  private tempDateRange = signal<DateRange>({ start: null, end: null });

  /** Texto de búsqueda global */
  searchTerm = signal('');

  /** Filtros de columna activos */
  columnFilters = signal<Record<string, string>>({});

  /** Página actual */
  currentPage = signal(1);
  /** Tamaño de página */
  pageSize = signal(10);

  /** Datos filtrados por fecha, búsqueda y columnas */
  filteredData = computed(() => {
    let data = this.allData();
    const range = this.dateRange();
    const term = this.searchTerm().toLowerCase().trim();
    const colFilters = this.columnFilters();

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

    // Filtrar por filtros de columna individuales
    for (const [key, val] of Object.entries(colFilters)) {
      if (val) {
        const colTerm = val.toLowerCase().trim();
        data = data.filter((r) => {
          const cellValue = String(r[key as keyof CeloRegistro] || '').toLowerCase();
          return cellValue.includes(colTerm);
        });
      }
    }

    return data;
  });

  /** Manejar cambio de filtros por columna */
  onColumnFilter(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
    this.currentPage.set(1);
  }

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
    this.tempDateRange.set(range);
  }

  /** Aplicar filtros activos (rango de fechas) */
  onApplyFilters(): void {
    this.dateRange.set(this.tempDateRange());
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

  vacas = [
    { id: 1, codigo: 'VAC-001', nombre: 'Clara', diasRestante: 2, estado: 'Próximo', vecesEnCelo: 2, crias: 1 },
    { id: 2, codigo: 'VAC-002', nombre: 'Bella', diasRestante: 0, estado: 'En celo', vecesEnCelo: 4, crias: 2 },
    { id: 3, codigo: 'VAC-003', nombre: 'Rosa', diasRestante: 15, estado: 'Pasó', vecesEnCelo: 3, crias: 0 },
    { id: 4, codigo: 'VAC-004', nombre: 'Daisy', diasRestante: 5, estado: 'Próximo', vecesEnCelo: 1, crias: 0 },
    { id: 5, codigo: 'VAC-005', nombre: 'Luna', diasRestante: 0, estado: 'En celo', vecesEnCelo: 5, crias: 3 }
  ];

  caracteristicas = [
    { code: 'MUGE', nombre: 'Mugido persistente' },
    { code: 'SECRECION', nombre: 'Secreción vulvar' },
    { code: 'INQUIETA', nombre: 'Inquietud / Nerviosismo' },
    { code: 'MONTADA', nombre: 'Se deja montar' },
    { code: 'MONTA_OTRAS', nombre: 'Monta a otras vacas' },
    { code: 'VULVA_INFLAMADA', nombre: 'Vulva inflamada' },
    { code: 'OTROS', nombre: 'Otros' }
  ];

  nuevoCelo = {
    vacunoId: 1,
    fechaHora: '',
    observaciones: '',
    caracteristicaCodes: [] as string[]
  };

  textoBusquedaVacuno = '';
  mostrarDropdownVacunos = false;
  vacasFiltradas: typeof this.vacas = [];
  textoOtraCaracteristica = '';

  private getLocalDateTimeString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  resetNuevoCelo(): void {
    this.nuevoCelo = {
      vacunoId: 0,
      fechaHora: this.getLocalDateTimeString(),
      observaciones: '',
      caracteristicaCodes: []
    };
    this.textoBusquedaVacuno = '';
    this.mostrarDropdownVacunos = false;
    this.vacasFiltradas = [...this.vacas];
    this.textoOtraCaracteristica = '';
    this.caracteristicas = [
      { code: 'MUGE', nombre: 'Mugido persistente' },
      { code: 'SECRECION', nombre: 'Secreción vulvar' },
      { code: 'INQUIETA', nombre: 'Inquietud / Nerviosismo' },
      { code: 'MONTADA', nombre: 'Se deja montar' },
      { code: 'MONTA_OTRAS', nombre: 'Monta a otras vacas' },
      { code: 'VULVA_INFLAMADA', nombre: 'Vulva inflamada' },
      { code: 'OTROS', nombre: 'Otros' }
    ];
  }

  mostrarModalNuevoCelo = false;

  abrirModalNuevoCelo(): void {
    this.resetNuevoCelo();
    this.mostrarModalNuevoCelo = true;
  }

  cerrarModalNuevoCelo(): void {
    this.mostrarModalNuevoCelo = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.buscador-vacuno-container')) {
      this.mostrarDropdownVacunos = false;
    }
  }

  onBusquedaVacunoChange(): void {
    const term = this.textoBusquedaVacuno.toLowerCase().trim();
    if (!term) {
      this.vacasFiltradas = [...this.vacas];
    } else {
      this.vacasFiltradas = this.vacas.filter(v =>
        v.codigo.toLowerCase().includes(term) ||
        v.nombre.toLowerCase().includes(term)
      );
    }
    this.mostrarDropdownVacunos = true;
  }

  toggleDropdownVacunos(event: Event): void {
    event.stopPropagation();
    this.mostrarDropdownVacunos = !this.mostrarDropdownVacunos;
    if (this.mostrarDropdownVacunos) {
      this.vacasFiltradas = [...this.vacas];
    }
  }

  seleccionarVacuno(vaca: typeof this.vacas[0]): void {
    this.nuevoCelo.vacunoId = vaca.id;
    this.textoBusquedaVacuno = `${vaca.codigo} - ${vaca.nombre}`;
    this.mostrarDropdownVacunos = false;
  }

  cambiarCaracteristica(code: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!this.nuevoCelo.caracteristicaCodes.includes(code)) {
        this.nuevoCelo.caracteristicaCodes = [...this.nuevoCelo.caracteristicaCodes, code];
      }
    } else {
      this.nuevoCelo.caracteristicaCodes = this.nuevoCelo.caracteristicaCodes.filter(c => c !== code);
    }
  }

  agregarOtraCaracteristica(): void {
    const nombre = this.textoOtraCaracteristica.trim();
    if (!nombre) return;

    const existe = this.caracteristicas.some(c => c.nombre.toLowerCase() === nombre.toLowerCase());
    if (existe) {
      const item = this.caracteristicas.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
      if (item && !this.nuevoCelo.caracteristicaCodes.includes(item.code)) {
        this.nuevoCelo.caracteristicaCodes = [...this.nuevoCelo.caracteristicaCodes, item.code];
      }
      this.textoOtraCaracteristica = '';
      return;
    }

    const code = 'CUSTOM_' + new Date().getTime();
    this.caracteristicas = [...this.caracteristicas, { code, nombre }];
    this.nuevoCelo.caracteristicaCodes = [...this.nuevoCelo.caracteristicaCodes, code];
    this.textoOtraCaracteristica = '';
  }

  guardarNuevoCelo(): void {
    if (!this.nuevoCelo.vacunoId) {
      alert('Por favor, seleccione un vacuno.');
      return;
    }
    if (!this.nuevoCelo.fechaHora) {
      alert('Por favor, ingrese la fecha y hora del celo.');
      return;
    }

    const requestData = {
      vacunoId: Number(this.nuevoCelo.vacunoId),
      encargadoUsuarioId: 1,
      fechaHora: this.nuevoCelo.fechaHora,
      observaciones: this.nuevoCelo.observaciones,
      caracteristicaCodes: this.nuevoCelo.caracteristicaCodes
    };

    this.celoApiService.registrarCelo(requestData).subscribe({
      next: () => {
        alert('¡Celo registrado con éxito!');
        this.cerrarModalNuevoCelo();
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Error al registrar celo:', err);
        alert('Error al registrar el celo. Por favor, intente nuevamente.');
      }
    });
  }
}
