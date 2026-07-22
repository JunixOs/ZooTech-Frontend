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
  totalItems = this.facade.totalItems;

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

  readonly searchTerm = signal('');
  readonly columnFilters = signal<Record<string, string>>({});
  readonly dateRange = signal<DateRange>({ start: null, end: null });
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  /** Estado de modales */
  showFormModal = signal(false);
  showDetailModal = signal(false);

  protected readonly encargadoUsuarioId = computed(() => this.resolveEncargadoUsuarioId());
  protected readonly encargadoNombre = this.authService.userName;
  selectedId = signal<number | null>(null);

  private resolveEncargadoUsuarioId(): number | null {
    const tokenUserId = this.getUsuarioIdFromToken();
    return tokenUserId ?? this.authService.userId();
  }

  private getUsuarioIdFromToken(): number | null {
    const token = this.authService.getToken();
    const payload = token ? this.decodeJwtPayload(token) : null;
    const rawId = payload
      ? (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
        payload['nameid'] ??
        payload['usuarioId'] ??
        payload['userId'] ??
        payload['id'])
      : null;
    const id = Number(rawId);

    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    const [, encodedPayload] = token.split('.');
    if (!encodedPayload) return null;

    try {
      const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      return JSON.parse(atob(padded)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private parseDisplayDate(fechaStr: string): Date {
    const [day, month, year] = fechaStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  /** Datos filtrados por fecha y búsqueda */
  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const filters = this.columnFilters();
    let data = this.registros();

    // Filtrar por búsqueda global
    if (term) {
      data = data.filter(
        (r) =>
          r.codigoRegistro.toLowerCase().includes(term) ||
          r.vacunoCodigo.toLowerCase().includes(term) ||
          (r.nombreVacuno && r.nombreVacuno.toLowerCase().includes(term)),
      );
    }

    const filterKeys = Object.keys(filters);
    if (filterKeys.length > 0) {
      data = data.filter((row) =>
        filterKeys.every((key) => {
          const filterValue = filters[key]?.toLowerCase().trim();
          if (!filterValue) return true;
          const rawValue = row[key];
          if (rawValue === null || rawValue === undefined) return false;
          return String(rawValue).toLowerCase().includes(filterValue);
        }),
      );
    }

    return data;
  });

  ngOnInit(): void {
    this.loadPage();
  }

  /** Manejar búsqueda global */
  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
  }

  /** Manejar cambio de rango de fechas */
  onDateRangeChange(range: DateRange): void {
    this.dateRange.set(range);
    this.currentPage.set(1);
    this.loadPage();
  }

  /** Manejar cambio de página */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPage();
  }

  /** Manejar cambio de tamaño de página */
  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadPage();
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
    this.loadPage();
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

  private loadPage(): void {
    const range = this.dateRange();
    this.facade.cargarRegistros({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      fechaDesde: range.start ? range.start.toISOString().split('T')[0] : undefined,
      fechaHasta: range.end ? range.end.toISOString().split('T')[0] : undefined,
    });
  }
}
