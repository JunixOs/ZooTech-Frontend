import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  RegistrarCeloRequest,
  VacaCelo as DomainVacaCelo,
} from '@modules/reproduccion/celo/domain/models/celo.model';
import { CeloFacade } from '../../application/celo.facade';
import { CeloValidator } from '@modules/reproduccion/celo/domain/validators/celo.validator';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { createTableFilterState } from '@shared/utils/table-filter-state';

type EstadoCelo = 'enCelo' | 'proximo' | 'paso';
type SubmitMessageType = 'success' | 'error';

interface VacaCelo extends Omit<DomainVacaCelo, 'estado'> {
  fecha?: string;
  estado: string;
}

interface CaracteristicaCelo {
  code: string;
  labelKey: string;
  nombre?: string;
}

const DEFAULT_CARACTERISTICAS: CaracteristicaCelo[] = [
  { code: 'MUGE', labelKey: 'reproduccion.celo.vacas.modal.characteristics.muge' },
  { code: 'SECRECION', labelKey: 'reproduccion.celo.vacas.modal.characteristics.secrecion' },
  { code: 'INQUIETA', labelKey: 'reproduccion.celo.vacas.modal.characteristics.inquieta' },
  { code: 'MONTADA', labelKey: 'reproduccion.celo.vacas.modal.characteristics.montada' },
  { code: 'MONTA_OTRAS', labelKey: 'reproduccion.celo.vacas.modal.characteristics.montaOtras' },
  {
    code: 'VULVA_INFLAMADA',
    labelKey: 'reproduccion.celo.vacas.modal.characteristics.vulvaInflamada',
  },
  { code: 'OTROS', labelKey: 'reproduccion.celo.vacas.modal.characteristics.otros' },
];

@Component({
  selector: 'zt-vacas-celo',
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    DateRangeFilterComponent,
    DataTableComponent,
    PageHeaderComponent,
    ModalComponent,
  ],
  templateUrl: './vacas-celo.component.html',
  styleUrl: './vacas-celo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacasCeloComponent implements OnInit {
  private readonly facade = inject(CeloFacade);
  private readonly destroyRef = inject(DestroyRef);

  readonly vacasFiltradas = signal<VacaCelo[]>([]);
  readonly caracteristicas = signal<CaracteristicaCelo[]>(DEFAULT_CARACTERISTICAS);
  readonly mostrarModalNuevoCelo = signal(false);
  readonly mostrarDropdownVacunos = signal(false);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitMessageKey = signal<string | null>(null);
  readonly submitMessageType = signal<SubmitMessageType>('success');
  readonly errors = signal<Record<string, string>>({});

  private readonly tableFilters = createTableFilterState<VacaCelo>(() => this.filteredData());
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
      key: 'codigo',
      headerKey: 'reproduccion.celo.vacas.columns.codigoVacuno',
      sortable: true,
      filterable: true,
      width: '120px',
    },
    {
      key: 'nombre',
      headerKey: 'reproduccion.celo.vacas.columns.nombre',
      sortable: true,
      filterable: true,
      width: 'auto',
    },
    {
      key: 'diasRestante',
      headerKey: 'reproduccion.celo.vacas.columns.diasRestante',
      sortable: true,
      filterable: true,
      align: 'center',
      width: '130px',
    },
    {
      key: 'estado',
      headerKey: 'reproduccion.celo.vacas.columns.estado',
      sortable: true,
      filterable: true,
      filterType: 'toggle',
      filterOptions: [
        {
          value: 'En Celo',
          label: 'reproduccion.celo.vacas.status.enCelo',
        },
        {
          value: 'Próximo',
          label: 'reproduccion.celo.vacas.status.proximo',
        },
        {
          value: 'Pasó',
          label: 'reproduccion.celo.vacas.status.paso',
        },
      ],
      align: 'center',
      width: '140px',
    },
    {
      key: 'vecesEnCelo',
      headerKey: 'reproduccion.celo.vacas.columns.vecesEnCelo',
      sortable: true,
      filterable: true,
      align: 'center',
      width: '130px',
    },
    {
      key: 'crias',
      headerKey: 'reproduccion.celo.vacas.columns.crias',
      sortable: true,
      filterable: true,
      align: 'center',
      width: '90px',
    },
  ];

  readonly filteredData = computed(() => {
    // Date range is applied server-side (cargarVacasEnCelo passes fechaInicio/fechaFin
    // to the backend); VacaCelo has no `fecha` field to re-filter by here.
    let data = this.facade.vacasEnCelo() as VacaCelo[];
    const term = this.searchTerm().toLowerCase().trim();
    const colFilters = this.columnFilters();

    if (term) {
      data = data.filter(
        (vaca) =>
          vaca.codigo.toLowerCase().includes(term) ||
          vaca.nombre.toLowerCase().includes(term) ||
          vaca.estado.toLowerCase().includes(term),
      );
    }

    for (const [key, val] of Object.entries(colFilters)) {
      if (!val) continue;
      const colTerm = val.toLowerCase().trim();
      data = data.filter((vaca) => {
        const cellValue = String(vaca[key as keyof VacaCelo] ?? '').toLowerCase();
        return cellValue.includes(colTerm);
      });
    }

    return data;
  });

  textoBusquedaVacuno = '';
  textoOtraCaracteristica = '';
  nuevoCelo: RegistrarCeloRequest = this.createEmptyCeloRequest();

  ngOnInit(): void {
    this.cargarVacasEnCelo();
  }

  abrirModalNuevoCelo(): void {
    this.resetNuevoCelo();
    this.mostrarModalNuevoCelo.set(true);
  }

  cerrarModalNuevoCelo(): void {
    this.mostrarModalNuevoCelo.set(false);
    this.errors.set({});
    this.submitMessageKey.set(null);
  }

  onDateRangeChange(range: DateRange): void {
    this.tempDateRange.set(range);
    if (range.start === null && range.end === null) {
      this.dateRange.set(range);
      this.currentPage.set(1);
      this.cargarVacasEnCelo();
    }
  }

  onApplyFilters(): void {
    this.dateRange.set(this.tempDateRange());
    this.currentPage.set(1);
    this.cargarVacasEnCelo();
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
    this.currentPage.set(1);
  }

  onSearch(term: string): void {
    this.tableFilters.onSearch(term);
  }

  onPageChange(page: number): void {
    this.tableFilters.onPageChange(page);
  }

  onPageSizeChange(size: number): void {
    this.tableFilters.onPageSizeChange(size);
  }

  onConfirmRow(row: Record<string, unknown>): void {
    const vacunoId = Number(row['id'] ?? 0);
    const vaca = (this.facade.vacasEnCelo() as VacaCelo[]).find((item) => item.id === vacunoId);
    if (!vaca) return;

    this.abrirModalNuevoCelo();
    this.seleccionarVacuno(vaca);
  }

  onBusquedaVacunoChange(): void {
    const term = this.textoBusquedaVacuno.toLowerCase().trim();
    const vacas = this.facade.vacasEnCelo() as VacaCelo[];
    const filtered = term
      ? vacas.filter(
          (vaca) =>
            vaca.codigo.toLowerCase().includes(term) || vaca.nombre.toLowerCase().includes(term),
        )
      : vacas;

    this.vacasFiltradas.set(filtered);
    this.mostrarDropdownVacunos.set(true);
  }

  toggleDropdownVacunos(event: Event): void {
    event.stopPropagation();
    this.mostrarDropdownVacunos.update((value) => !value);
    if (this.mostrarDropdownVacunos()) {
      this.vacasFiltradas.set(this.facade.vacasEnCelo() as VacaCelo[]);
    }
  }

  seleccionarVacuno(vaca: VacaCelo): void {
    this.nuevoCelo = { ...this.nuevoCelo, vacunoId: vaca.id };
    this.textoBusquedaVacuno = `${vaca.codigo} - ${vaca.nombre}`;
    this.mostrarDropdownVacunos.set(false);
  }

  cambiarCaracteristica(code: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const codes = this.nuevoCelo.caracteristicaCodes;
    const nextCodes = isChecked
      ? Array.from(new Set([...codes, code]))
      : codes.filter((currentCode) => currentCode !== code);

    this.nuevoCelo = { ...this.nuevoCelo, caracteristicaCodes: nextCodes };
  }

  agregarOtraCaracteristica(): void {
    const nombre = this.textoOtraCaracteristica.trim();
    if (!nombre) return;

    const existing = this.caracteristicas().find(
      (item) => this.getCaracteristicaLabel(item).toLowerCase() === nombre.toLowerCase(),
    );

    if (existing) {
      this.nuevoCelo = {
        ...this.nuevoCelo,
        caracteristicaCodes: Array.from(
          new Set([...this.nuevoCelo.caracteristicaCodes, existing.code]),
        ),
      };
      this.textoOtraCaracteristica = '';
      return;
    }

    const code = `CUSTOM_${Date.now()}`;
    this.caracteristicas.update((items) => [...items, { code, nombre, labelKey: nombre }]);
    this.nuevoCelo = {
      ...this.nuevoCelo,
      caracteristicaCodes: [...this.nuevoCelo.caracteristicaCodes, code],
    };
    this.textoOtraCaracteristica = '';
  }

  guardarNuevoCelo(): void {
    this.submitMessageKey.set(null);

    const validation = CeloValidator.validateRequest(this.nuevoCelo);
    if (!validation.isValid) {
      this.errors.set(validation.errors);

      if (validation.errors['vacunoId']) {
        this.setSubmitMessage('reproduccion.celo.vacas.modal.validation.vacunoRequired', 'error');
        return;
      }

      if (validation.errors['fechaHora']) {
        this.setSubmitMessage('reproduccion.celo.vacas.modal.validation.dateRequired', 'error');
        return;
      }

      if (validation.errors['encargadoUsuarioId']) {
        this.setSubmitMessage(
          'reproduccion.celo.vacas.modal.validation.encargadoRequired',
          'error',
        );
        return;
      }

      if (validation.errors['caracteristicaCodes']) {
        this.setSubmitMessage(
          'reproduccion.celo.vacas.modal.validation.characteristicsRequired',
          'error',
        );
        return;
      }

      this.setSubmitMessage('reproduccion.celo.vacas.modal.messages.error', 'error');
      return;
    }

    this.errors.set({});

    if (!this.nuevoCelo.vacunoId) {
      this.setSubmitMessage('reproduccion.celo.vacas.modal.validation.vacunoRequired', 'error');
      return;
    }

    if (!this.nuevoCelo.fechaHora) {
      this.setSubmitMessage('reproduccion.celo.vacas.modal.validation.dateRequired', 'error');
      return;
    }

    this.isSubmitting.set(true);
    this.facade
      .registrarCelo(this.nuevoCelo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.setSubmitMessage('reproduccion.celo.vacas.modal.messages.saved', 'success');
          this.cerrarModalNuevoCelo();
          this.resetNuevoCelo();
          this.cargarVacasEnCelo();
        },
        error: (err: Error) => {
          console.error('[VacasCelo] Error al registrar celo:', err.message);
          this.isSubmitting.set(false);
          this.setSubmitMessage('reproduccion.celo.vacas.modal.messages.error', 'error');
        },
      });
  }

  getEstadoKey(estado: EstadoCelo): string {
    return `reproduccion.celo.vacas.status.${estado}`;
  }

  getCaracteristicaLabel(item: CaracteristicaCelo): string {
    return item.nombre ?? item.labelKey ?? item.code;
  }

  private resetNuevoCelo(): void {
    this.nuevoCelo = this.createEmptyCeloRequest();
    this.textoBusquedaVacuno = '';
    this.textoOtraCaracteristica = '';
    this.vacasFiltradas.set(this.facade.vacasEnCelo() as VacaCelo[]);
    this.caracteristicas.set(DEFAULT_CARACTERISTICAS);
    this.mostrarDropdownVacunos.set(false);
    this.submitMessageKey.set(null);
    this.errors.set({});
  }

  private cargarVacasEnCelo(): void {
    const range = this.tempDateRange();
    const fechaInicio = this.formatDateParam(range.start);
    const fechaFin = this.formatDateParam(range.end);

    this.facade.cargarVacasEnCelo(fechaInicio, fechaFin);
    this.vacasFiltradas.set(this.facade.vacasEnCelo() as VacaCelo[]);
  }

  private formatDateParam(date: Date | null): string | undefined {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private createEmptyCeloRequest(): RegistrarCeloRequest {
    return {
      vacunoId: 0,
      encargadoUsuarioId: 0,
      fechaHora: this.getLocalDateTimeString(),
      observaciones: '',
      caracteristicaCodes: [],
    };
  }

  private getLocalDateTimeString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private setSubmitMessage(key: string, type: SubmitMessageType): void {
    this.submitMessageKey.set(key);
    this.submitMessageType.set(type);
  }
}
