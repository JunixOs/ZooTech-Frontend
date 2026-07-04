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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastService } from '@core/notifications/toast.service';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { CeloRegistro } from '@modules/reproduccion/celo/domain/models/celo.model';
import { CeloFacade } from '../../application/celo.facade';
import {
  CeloEditable,
  EditarCeloForm,
  EditarCeloModal,
} from '@modules/reproduccion/components/editar-celo-modal/editar-celo-modal';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ButtonComponent } from '@shared/ui/button.component';
import { createTableFilterState } from '@shared/utils/table-filter-state';

@Component({
  selector: 'zt-celo-container',
  standalone: true,
  imports: [
    DateRangeFilterComponent,
    DataTableComponent,
    EditarCeloModal,
    TranslatePipe,
    RouterLink,
    PageHeaderComponent,
    ButtonComponent,
  ],
  templateUrl: './celo-container.component.html',
  styleUrl: './celo-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CeloContainerComponent implements OnInit {
  private readonly facade = inject(CeloFacade);
    private readonly destroyRef = inject(DestroyRef);
    private readonly toastService = inject(ToastService);
    private readonly translate = inject(TranslateService);
  readonly isLoading = this.facade.isLoading;
  readonly error = this.facade.error;
  readonly celoSeleccionado = signal<CeloRegistro | null>(null);
  readonly mostrarModalEditarCelo = signal(false);

  private readonly tableFilters = createTableFilterState<CeloRegistro>(() => this.filteredData());
  private readonly dateRange = this.tableFilters.dateRange;
  private readonly tempDateRange = signal<DateRange>({ start: null, end: null });
  readonly searchTerm = this.tableFilters.searchTerm;
  readonly columnFilters = signal<Record<string, string>>({});
  readonly currentPage = this.tableFilters.currentPage;
  readonly pageSize = this.tableFilters.pageSize;
  readonly totalItems = this.tableFilters.totalItems;
  readonly paginatedData = this.tableFilters.paginatedData;

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

  readonly filteredData = computed(() => {
    let data = this.facade.celos();
    const range = this.dateRange();
    const term = this.searchTerm().toLowerCase().trim();
    const colFilters = this.columnFilters();

    if (range.start) {
      const start = new Date(range.start);
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
          r.codigoRegistro.toLowerCase().includes(term) ||
          r.codigoVacuno.toLowerCase().includes(term) ||
          r.nombreVacuno.toLowerCase().includes(term),
      );
    }

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

  ngOnInit(): void {
    this.cargarRegistros();
  }

  private cargarRegistros(): void {
    this.facade.cargarCelos();
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
    this.currentPage.set(1);
  }

  onSearch(term: string): void {
    this.tableFilters.onSearch(term);
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
    this.tableFilters.onPageChange(page);
  }

  onPageSizeChange(size: number): void {
    this.tableFilters.onPageSizeChange(size);
  }
   
  onViewRow(row: Record<string, unknown>): void {
    this.celoSeleccionado.set(row as unknown as CeloRegistro);
    this.mostrarModalEditarCelo.set(true);
  }

  cerrarModalEditarCelo(): void {
    this.mostrarModalEditarCelo.set(false);
    this.celoSeleccionado.set(null);
  }

  guardarEdicionCelo(form: EditarCeloForm): void {
    const registro = this.celoSeleccionado();

    if (!registro?.id) {
      console.log('❌ El registro no tiene ID:', registro);

      this.facade.error.set(
        this.translate.instant(
          'reproduccion.celo.messages.editIdRequired',
        ),
      );
      return;
    }

    console.log('📤 Enviando actualización:', {
      id: registro.id,
      observaciones: form.observaciones,
      caracteristicaCodes: form.caracteristicaCodes,
    });

    this.facade
      .actualizarCelo({
        id: registro.id,
        observaciones: form.observaciones,
        caracteristicaCodes: form.caracteristicaCodes,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('✅ Entró al next del actualizar');

          this.cerrarModalEditarCelo();

          this.toastService.success(
            this.translate.instant(
              'reproduccion.celo.messages.updatedSuccess',
            ),
          );
        },
        error: (err: Error) => {
          console.log('❌ Entró al error del actualizar');

          console.error('[CeloContainer] Error al actualizar celo:', err);

          this.toastService.error(
            this.translate.instant(
              'reproduccion.celo.messages.updatedError',
            ),
          );

          this.facade.error.set(err.message);
        },
      });
  }

  eliminarCelo(registro: CeloEditable): void {
    console.log('Registro recibido:', registro);
    console.log('ID:', registro.id);

    if (!registro.id) {
      this.facade.error.set(
        'No se puede eliminar: el listado del backend no incluye el ID numérico requerido.',
      );
      return;
    }
    this.facade
      .eliminarCelo({
        id: registro.id,
        motivoEliminacion: registro.motivoEliminacion ?? '',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cerrarModalEditarCelo();

          this.toastService.success(
            this.translate.instant('reproduccion.celo.messages.deletedSuccess'),
          );
        },
        error: (err: Error) => {
          console.error('[CeloContainer] Error al eliminar celo:', err.message);

          this.toastService.error(
            this.translate.instant('reproduccion.celo.messages.deletedError'),
          );

          this.facade.error.set(err.message);
        },
      });
  }
}
