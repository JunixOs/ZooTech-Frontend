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
import { createServerTableState } from '@shared/utils/server-table-state';

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

  // Búsqueda, paginación y rango de fechas ahora viven en el servidor:
  // `createServerTableState` llama a `facade.cargarCelos` con
  // { search, page, pageSize, fechaInicio, fechaFin } y expone la página
  // actual + el total real (sin traer todo el dataset al navegador). El
  // filtro por columna queda fuera de alcance (necesitaría un query param
  // distinto por columna); por eso se oculta la UI de filtro por columna en
  // el template (`filterable: false` en `columns`).
  private readonly tableState = createServerTableState<CeloRegistro>(
    ({ search, page, pageSize, fechaInicio, fechaFin }) =>
      this.facade.cargarCelos({ search, page, pageSize, fechaInicio, fechaFin }),
  );
  private readonly tempDateRange = signal<DateRange>({ start: null, end: null });
  readonly searchTerm = this.tableState.searchTerm;
  readonly currentPage = this.tableState.currentPage;
  readonly pageSize = this.tableState.pageSize;
  readonly totalItems = this.tableState.totalItems;
  // `zt-data-table` espera `Record<string, unknown>[]`; el servidor ya
  // devuelve la página + total filtrados, así que no hace falta ningún
  // recorte adicional en el cliente (ver comentario en `tableState`).
  readonly data = computed(
    () => this.tableState.data() as unknown as Record<string, unknown>[],
  );

  readonly columns: ColumnConfig[] = [
    {
      key: 'codigoRegistro',
      headerKey: 'reproduccion.celo.columns.codigoRegistro',
      sortable: true,
      // El filtro por columna no tiene soporte en el backend para este
      // endpoint (necesitaría un query param distinto por columna, fuera de
      // alcance); se deja `filterable: false` para ocultar la UI en
      // `zt-data-table` en vez de mostrar un filtro que no funciona.
      filterable: false,
      width: '120px',
    },
    {
      key: 'fecha',
      headerKey: 'reproduccion.celo.columns.fecha',
      sortable: true,
      filterable: false,
      width: '120px',
    },
    {
      key: 'hora',
      headerKey: 'reproduccion.celo.columns.hora',
      sortable: true,
      filterable: false,
      width: '100px',
    },
    {
      key: 'codigoVacuno',
      headerKey: 'reproduccion.celo.columns.codigo',
      sortable: true,
      filterable: false,
      width: '120px',
    },
    {
      key: 'nombreVacuno',
      headerKey: 'reproduccion.celo.columns.nombre',
      sortable: true,
      filterable: false,
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

  ngOnInit(): void {
    this.tableState.init();
  }

  onSearch(term: string): void {
    this.tableState.onSearch(term);
  }

  onDateRangeChange(range: DateRange): void {
    this.tempDateRange.set(range);

    if (range.start === null && range.end === null) {
      this.tableState.onDateRangeChange({});
    }
  }

  onApplyFilters(): void {
    const range = this.tempDateRange();

    this.tableState.onDateRangeChange({
      fechaInicio: this.formatDateParam(range.start),
      fechaFin: this.formatDateParam(range.end),
    });
  }

  private formatDateParam(date: Date | null): string | undefined {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  onPageChange(page: number): void {
    this.tableState.onPageChange(page);
  }

  onPageSizeChange(size: number): void {
    this.tableState.onPageSizeChange(size);
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
          this.tableState.reload();

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
          this.tableState.reload();

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
