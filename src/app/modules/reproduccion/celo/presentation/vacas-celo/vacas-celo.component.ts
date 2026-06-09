<<<<<<< HEAD
=======
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  inject,
  signal
} from '@angular/core';
>>>>>>> ARACELY_GONZALES/feature
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
<<<<<<< HEAD
import { TranslatePipe } from '@ngx-translate/core';
import { RegistrarCeloRequest } from '@modules/reproduccion/celo/domain/models/celo.model';
import { CeloApiService } from '@modules/reproduccion/celo/infrastructure/celo-api.service';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';

type EstadoCelo = 'enCelo' | 'proximo' | 'paso';
type SubmitMessageType = 'success' | 'error';

interface VacaCelo {
  id: number;
  codigo: string;
  nombre: string;
  fecha: string;
  diasRestante: number;
  estado: string;
  vecesEnCelo: number;
  crias: number;
}
=======

import {
  CeloApiService,
  VacaCelo
} from '@modules/reproduccion/celo/infrastructure/celo-api.service';

import { RegistrarCeloRequest } from '@modules/reproduccion/celo/domain/models/celo.model';
import { CeloValidator } from '@modules/reproduccion/celo/domain/validators/celo.validator';
>>>>>>> ARACELY_GONZALES/feature

interface CaracteristicaCelo {
  code: string;
  labelKey?: string;
  nombre?: string;
}

const DEFAULT_ENCARGADO_USUARIO_ID = 1;

const MOCK_VACAS: VacaCelo[] = [
  {
    id: 1,
    codigo: 'VAC-001',
    nombre: 'Clara',
    fecha: '2026-05-10',
    diasRestante: 2,
    estado: 'reproduccion.celo.vacas.status.proximo',
    vecesEnCelo: 2,
    crias: 1,
  },
  {
    id: 2,
    codigo: 'VAC-002',
    nombre: 'Bella',
    fecha: '2026-05-11',
    diasRestante: 0,
    estado: 'reproduccion.celo.vacas.status.enCelo',
    vecesEnCelo: 4,
    crias: 2,
  },
  {
    id: 3,
    codigo: 'VAC-003',
    nombre: 'Rosa',
    fecha: '2026-05-12',
    diasRestante: 15,
    estado: 'reproduccion.celo.vacas.status.paso',
    vecesEnCelo: 3,
    crias: 0,
  },
  {
    id: 4,
    codigo: 'VAC-004',
    nombre: 'Daisy',
    fecha: '2026-05-13',
    diasRestante: 5,
    estado: 'reproduccion.celo.vacas.status.proximo',
    vecesEnCelo: 1,
    crias: 0,
  },
  {
    id: 5,
    codigo: 'VAC-005',
    nombre: 'Luna',
    fecha: '2026-05-14',
    diasRestante: 0,
    estado: 'reproduccion.celo.vacas.status.enCelo',
    vecesEnCelo: 5,
    crias: 3,
  },
];

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
  imports: [CommonModule, FormsModule, TranslatePipe, DateRangeFilterComponent, DataTableComponent],
  templateUrl: './vacas-celo.component.html',
  styleUrl: './vacas-celo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
<<<<<<< HEAD
export class VacasCeloComponent {
  private readonly celoApiService = inject(CeloApiService);
  private readonly destroyRef = inject(DestroyRef);
=======
export class VacasCeloComponent implements OnInit {
  private celoApiService = inject(CeloApiService);
  private cdr = inject(ChangeDetectorRef);

  errors = signal<Record<string, string>>({});
>>>>>>> ARACELY_GONZALES/feature

  readonly vacas = signal<VacaCelo[]>(MOCK_VACAS);
  readonly vacasFiltradas = signal<VacaCelo[]>(MOCK_VACAS);
  readonly caracteristicas = signal<CaracteristicaCelo[]>(DEFAULT_CARACTERISTICAS);
  readonly mostrarModalNuevoCelo = signal(false);
  readonly mostrarDropdownVacunos = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitMessageKey = signal<string | null>(null);
  readonly submitMessageType = signal<SubmitMessageType>('success');

<<<<<<< HEAD
  private readonly dateRange = signal<DateRange>({ start: null, end: null });
  private readonly tempDateRange = signal<DateRange>({ start: null, end: null });
  readonly searchTerm = signal('');
  readonly columnFilters = signal<Record<string, string>>({});
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

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
      filterable: false,
      align: 'center',
      width: '130px',
    },
    {
      key: 'estado',
      headerKey: 'reproduccion.celo.vacas.columns.estado',
      sortable: true,
      filterable: true,
      align: 'center',
      width: '140px',
    },
    {
      key: 'vecesEnCelo',
      headerKey: 'reproduccion.celo.vacas.columns.vecesEnCelo',
      sortable: true,
      filterable: false,
      align: 'center',
      width: '130px',
    },
    {
      key: 'crias',
      headerKey: 'reproduccion.celo.vacas.columns.crias',
      sortable: true,
      filterable: false,
      align: 'center',
      width: '90px',
    },
  ];
=======
  vacas: VacaCelo[] = [];
  vacasFiltradas: VacaCelo[] = [];

  cargando = false;
  errorCarga = '';

  fechaInicio = '';
  fechaFin = '';
  
  //filtrado de los estados de celo
  estadosCelo = ['En celo', 'Próximo', 'Pasó'];

  filtros = {
    codigo: '',
    nombre: '',
    diasRestante: '',
    estado: '',
    vecesEnCelo: '',
    crias: ''
  };
>>>>>>> ARACELY_GONZALES/feature

  readonly filteredData = computed(() => {
    let data = this.vacas();
    const range = this.dateRange();
    const term = this.searchTerm().toLowerCase().trim();
    const colFilters = this.columnFilters();

<<<<<<< HEAD
    if (range.start) {
      const start = new Date(range.start);
      data = data.filter((vaca) => new Date(vaca.fecha) >= start);
    }

    if (range.end) {
      const end = new Date(range.end);
      end.setHours(23, 59, 59, 999);
      data = data.filter((vaca) => new Date(vaca.fecha) <= end);
    }

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

  readonly totalItems = computed(() => this.filteredData().length);

  readonly paginatedData = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredData()
      .slice(start, start + this.pageSize())
      .map((item): Record<string, unknown> => ({ ...item }));
  });

  textoBusquedaVacuno = '';
  textoOtraCaracteristica = '';
  nuevoCelo: RegistrarCeloRequest = this.createEmptyCeloRequest();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.buscador-vacuno-container')) {
      this.mostrarDropdownVacunos.set(false);
    }
  }

  abrirModalNuevoCelo(): void {
=======
  nuevoCelo = {
    vacunoId: 0,
    fechaHora: '',
    observaciones: '',
    caracteristicaCodes: [] as string[]
  };

  textoBusquedaVacuno = '';
  mostrarDropdownVacunos = false;
  textoOtraCaracteristica = '';

  ngOnInit(): void {
    this.cargarVacasEnCelo();
>>>>>>> ARACELY_GONZALES/feature
    this.resetNuevoCelo();
    this.mostrarModalNuevoCelo.set(true);
  }

  cerrarModalNuevoCelo(): void {
    this.mostrarModalNuevoCelo.set(false);
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

  onColumnFilter(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
    this.currentPage.set(1);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onConfirmRow(row: Record<string, unknown>): void {
    const vacunoId = Number(row['id'] ?? 0);
    const vaca = this.vacas().find((item) => item.id === vacunoId);
    if (!vaca) return;

    this.abrirModalNuevoCelo();
    this.seleccionarVacuno(vaca);
  }

  onBusquedaVacunoChange(): void {
    const term = this.textoBusquedaVacuno.toLowerCase().trim();
    const vacas = this.vacas();
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
      this.vacasFiltradas.set(this.vacas());
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
    this.caracteristicas.update((items) => [...items, { code, nombre }]);
    this.nuevoCelo = {
      ...this.nuevoCelo,
      caracteristicaCodes: [...this.nuevoCelo.caracteristicaCodes, code],
    };
    this.textoOtraCaracteristica = '';
  }

  guardarNuevoCelo(): void {
    this.submitMessageKey.set(null);

    if (!this.nuevoCelo.vacunoId) {
      this.setSubmitMessage('reproduccion.celo.vacas.modal.validation.vacunoRequired', 'error');
      return;
    }

    if (!this.nuevoCelo.fechaHora) {
      this.setSubmitMessage('reproduccion.celo.vacas.modal.validation.dateRequired', 'error');
      return;
    }

    this.isSubmitting.set(true);
    this.celoApiService
      .registrarCelo(this.nuevoCelo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.setSubmitMessage('reproduccion.celo.vacas.modal.messages.saved', 'success');
          this.cerrarModalNuevoCelo();
          this.resetNuevoCelo();
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
    this.vacasFiltradas.set(this.vacas());
    this.caracteristicas.set(DEFAULT_CARACTERISTICAS);
    this.mostrarDropdownVacunos.set(false);
    this.submitMessageKey.set(null);
  }

  private createEmptyCeloRequest(): RegistrarCeloRequest {
    return {
      vacunoId: 0,
      encargadoUsuarioId: DEFAULT_ENCARGADO_USUARIO_ID,
      fechaHora: this.getLocalDateTimeString(),
      observaciones: '',
      caracteristicaCodes: [],
    };
  }

  cargarVacasEnCelo(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.celoApiService.listarVacasEnCelo(this.fechaInicio, this.fechaFin).subscribe({
      next: (data: VacaCelo[]) => {
        console.log('VACAS DESDE API:', data);
        this.vacas = data;
        this.vacasFiltradas = [...this.vacas];
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar vacas en celo:', err);
        this.errorCarga = 'No se pudieron cargar las vacas en celo.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  buscar(): void {
    this.cargarVacasEnCelo();
  }

  get vacasFiltradasTabla(): VacaCelo[] {
    return this.vacas.filter(vaca =>
      vaca.codigo.toLowerCase().includes(this.filtros.codigo.toLowerCase()) &&
      vaca.nombre.toLowerCase().includes(this.filtros.nombre.toLowerCase()) &&
      vaca.diasRestante.toString().includes(this.filtros.diasRestante) &&
      (!this.filtros.estado || vaca.estado === this.filtros.estado) &&
      vaca.vecesEnCelo.toString().includes(this.filtros.vecesEnCelo) &&
      vaca.crias.toString().includes(this.filtros.crias)
    );
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

<<<<<<< HEAD
  private setSubmitMessage(key: string, type: SubmitMessageType): void {
    this.submitMessageKey.set(key);
    this.submitMessageType.set(type);
=======
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

    this.errors.set({});
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

  seleccionarVacuno(vaca: VacaCelo): void {
    this.nuevoCelo.vacunoId = vaca.id;
    this.textoBusquedaVacuno = `${vaca.codigo} - ${vaca.nombre}`;
    this.mostrarDropdownVacunos = false;
  }

  abrirModalNuevoCelo(): void {
    this.resetNuevoCelo();
    this.mostrarModalNuevoCelo = true;
  }

  cerrarModalNuevoCelo(): void {
    this.mostrarModalNuevoCelo = false;
    this.errors.set({});
  }

  cambiarCaracteristica(code: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      if (!this.nuevoCelo.caracteristicaCodes.includes(code)) {
        this.nuevoCelo.caracteristicaCodes = [
          ...this.nuevoCelo.caracteristicaCodes,
          code
        ];
      }
    } else {
      this.nuevoCelo.caracteristicaCodes =
        this.nuevoCelo.caracteristicaCodes.filter(c => c !== code);
    }
  }

  agregarOtraCaracteristica(): void {
    const nombre = this.textoOtraCaracteristica.trim();

    if (!nombre) return;

    const existe = this.caracteristicas.some(
      c => c.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (existe) {
      const item = this.caracteristicas.find(
        c => c.nombre.toLowerCase() === nombre.toLowerCase()
      );

      if (item && !this.nuevoCelo.caracteristicaCodes.includes(item.code)) {
        this.nuevoCelo.caracteristicaCodes = [
          ...this.nuevoCelo.caracteristicaCodes,
          item.code
        ];
      }

      this.textoOtraCaracteristica = '';
      return;
    }

    const code = 'CUSTOM_' + new Date().getTime();

    this.caracteristicas = [
      ...this.caracteristicas,
      { code, nombre }
    ];

    this.nuevoCelo.caracteristicaCodes = [
      ...this.nuevoCelo.caracteristicaCodes,
      code
    ];

    this.textoOtraCaracteristica = '';
  }

  guardarNuevoCelo(): void {
    const requestData: RegistrarCeloRequest = {
      vacunoId: Number(this.nuevoCelo.vacunoId),
      encargadoUsuarioId: 1,
      fechaHora: this.nuevoCelo.fechaHora,
      observaciones: this.nuevoCelo.observaciones,
      caracteristicaCodes: this.nuevoCelo.caracteristicaCodes
    };

    const validation = CeloValidator.validateRequest(requestData);

    if (!validation.isValid) {
      this.errors.set(validation.errors);
      return;
    }

    this.errors.set({});

    this.celoApiService.registrarCelo(requestData).subscribe({
      next: () => {
        alert('¡Celo registrado con éxito!');
        this.cerrarModalNuevoCelo();
        this.cargarVacasEnCelo();
      },
      error: (err) => {
        console.error('Error al registrar celo:', err);
        alert('Error al registrar el celo. Por favor, intente nuevamente.');
      }
    });
>>>>>>> ARACELY_GONZALES/feature
  }
}
