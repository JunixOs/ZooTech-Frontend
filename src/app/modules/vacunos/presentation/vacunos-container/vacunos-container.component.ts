import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Vacuno } from '@modules/vacunos/domain/models/vacuno.model';
import { VacunosApiService } from '@modules/vacunos/infrastructure/vacunos-api.service';

type VacunoColumnFilters = {
  codigo: string;
  fecha: string;
  nombre: string;
  raza: string;
  procedencia: string;
  estado: '' | 'vivo' | 'muerto';
};

@Component({
  selector: 'zt-vacunos-container',
  standalone: true,
  imports: [],
  templateUrl: './vacunos-container.component.html',
  styleUrl: './vacunos-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosContainerComponent {
  private readonly maxTextLength = 15;
  private readonly maxCodeLength = 10;
  private readonly maxObservationLength = 150;
  private readonly maxObservationWords = 30;
  private readonly vacunosApi = inject(VacunosApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tableData = signal<Vacuno[]>([]);
  private readonly selectedVacunoData = signal<Vacuno | null>(null);
  private readonly selectedPhoto = signal<File | null>(null);

  readonly adquisicionOptions = signal(['monta', 'compra']);
  readonly razaOptions = signal([
    'Jersey',
    'Holstein',
    'Angus',
    'Hereford',
    'Simmental',
    'Brown Swiss',
    'Brahman',
    'Charolais',
  ]);
  readonly sexoOptions = signal<Vacuno['sexo'][]>(['hembra', 'macho']);
  readonly aptoParaOptions = signal(['produccion_leche', 'carne', 'reproduccion']);
  readonly departamentoOptions = signal(['Huanuco', 'San Martin', 'Pasco', 'Junin', 'Ucayali', 'Lima']);
  readonly provinciaOptions = signal(['Leoncio Prado', 'Tocache', 'Oxapampa', 'Chanchamayo', 'Lima']);
  readonly distritoOptions = signal(['Tulumayo', 'Tocache', 'Puerto Sungaro', 'Tarapoto', 'Huanuco', 'Oxapampa']);
  readonly fallbackPhotoUrl =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"%3E%3Crect width="640" height="420" fill="%23f8fafc"/%3E%3Cpath d="M0 300h640v120H0z" fill="%23d9f99d"/%3E%3Ccircle cx="506" cy="86" r="46" fill="%23facc15"/%3E%3Cpath d="M164 258c0-62 50-112 112-112h88c62 0 112 50 112 112v20H164v-20z" fill="%23802b4d"/%3E%3Ccircle cx="246" cy="196" r="16" fill="%23fff"/%3E%3Ccircle cx="390" cy="196" r="16" fill="%23fff"/%3E%3Cpath d="M270 260h100v46H270z" fill="%23f8fafc"/%3E%3C/svg%3E';

  readonly searchTerm = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(0);
  readonly loading = signal(false);
  readonly detailLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isEditing = signal(false);
  readonly isCreating = signal(false);
  readonly draftVacuno = signal<Vacuno | null>(null);
  readonly photoPreviewUrl = signal<string | null>(null);
  readonly columnFilters = signal<VacunoColumnFilters>({
    codigo: '',
    fecha: '',
    nombre: '',
    raza: '',
    procedencia: '',
    estado: '',
  });

  readonly vacunos = computed(() => this.applyColumnFilters(this.tableData()));
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  readonly visibleItems = computed(() => this.vacunos().length);
  readonly startItem = computed(() => (this.visibleItems() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1));
  readonly endItem = computed(() => (this.visibleItems() === 0 ? 0 : this.startItem() + this.visibleItems() - 1));
  readonly selectedVacuno = computed(() => this.selectedVacunoData());
  readonly detailVacuno = computed(() => this.draftVacuno() ?? this.selectedVacuno());

  constructor() {
    this.loadOptions();
    this.loadVacunos();

    if (this.router.url.includes('/vacunos/agregar')) {
      this.startCreate();
    }
  }

  onOpenCreate(): void {
    this.startCreate();
    void this.router.navigate(['/vacunos/agregar']);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadVacunos();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadVacunos();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadVacunos();
  }

  onSearchInput(term: string): void {
    this.onSearch(term);
  }

  setColumnFilter(field: keyof VacunoColumnFilters, value: string): void {
    this.columnFilters.update((filters) => ({
      ...filters,
      [field]: field === 'estado' ? value.toLowerCase() : value,
    }));
  }

  toggleEstadoFilter(estado: 'vivo' | 'muerto'): void {
    this.columnFilters.update((filters) => ({
      ...filters,
      estado: filters.estado === estado ? '' : estado,
    }));
  }

  onFirstPage(): void {
    if (this.currentPage() === 1) {
      return;
    }

    this.onPageChange(1);
  }

  onPreviousPage(): void {
    if (this.currentPage() === 1) {
      return;
    }

    this.onPageChange(this.currentPage() - 1);
  }

  onNextPage(): void {
    if (this.currentPage() >= this.totalPages()) {
      return;
    }

    this.onPageChange(this.currentPage() + 1);
  }

  onLastPage(): void {
    if (this.currentPage() >= this.totalPages()) {
      return;
    }

    this.onPageChange(this.totalPages());
  }

  onViewRow(row: Record<string, unknown>): void {
    const codigo = String(row['codigo'] ?? '');

    if (!codigo) {
      return;
    }

    this.detailLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.vacunosApi
      .getByCodigo(codigo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.detailLoading.set(false)),
      )
      .subscribe({
        next: (vacuno) => {
          this.selectedVacunoData.set(vacuno);
          this.draftVacuno.set({ ...vacuno });
          this.selectedPhoto.set(null);
          this.photoPreviewUrl.set(null);
          this.isEditing.set(false);
          this.isCreating.set(false);
        },
        error: () => {
          this.errorMessage.set('No se pudo cargar el detalle del vacuno.');
        },
      });
  }

  onCancelDetail(): void {
    this.selectedVacunoData.set(null);
    this.draftVacuno.set(null);
    this.selectedPhoto.set(null);
    this.photoPreviewUrl.set(null);
    this.isEditing.set(false);

    if (this.isCreating()) {
      this.isCreating.set(false);
      void this.router.navigate(['/vacunos'], { relativeTo: this.route.root });
      return;
    }

    this.successMessage.set(null);
  }

  onEdit(): void {
    if (this.isEditing() || this.isCreating()) {
      this.saveDraft();
      return;
    }

    const selected = this.selectedVacuno();

    if (!selected) {
      return;
    }

    this.draftVacuno.set({ ...selected });
    this.selectedPhoto.set(null);
    this.photoPreviewUrl.set(null);
    this.isEditing.set(true);
  }

  onDelete(): void {
    const selected = this.selectedVacuno();

    if (!selected || this.isCreating()) {
      return;
    }

    const confirmed = window.confirm(`Eliminar el registro ${selected.codigo} - ${selected.nombre}?`);

    if (!confirmed) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.vacunosApi
      .delete(selected.codigo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          this.onCancelDetail();
          this.loadVacunos();
        },
        error: () => {
          this.errorMessage.set('No se pudo eliminar el vacuno.');
        },
      });
  }

  setDraftValue(field: keyof Vacuno, value: string): void {
    this.draftVacuno.update((vacuno) => {
      if (!vacuno) {
        return vacuno;
      }

      const normalizedValue = this.normalizeFieldValue(field, value);

      return {
        ...vacuno,
        [field]: normalizedValue,
        precioCompra:
          field === 'adquisicionPor' && normalizedValue.toLowerCase() !== 'compra'
            ? null
            : vacuno.precioCompra,
      } as Vacuno;
    });
  }

  setDraftPrice(value: string): void {
    this.draftVacuno.update((vacuno) => {
      if (!vacuno) {
        return vacuno;
      }

      return {
        ...vacuno,
        precioCompra: value.trim() ? Number(value) : null,
      };
    });
  }

  blockInvalidNumberInput(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.selectedPhoto.set(null);
      this.photoPreviewUrl.set(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      input.value = '';
      this.selectedPhoto.set(null);
      this.photoPreviewUrl.set(null);
      this.errorMessage.set('La foto debe estar en formato JPG, JPEG o PNG.');
      return;
    }

    this.errorMessage.set(null);
    this.selectedPhoto.set(file);
    this.photoPreviewUrl.set(URL.createObjectURL(file));
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  }

  formatProcedencia(vacuno: Vacuno): string {
    return vacuno.distrito || vacuno.provincia || vacuno.departamento || vacuno.granja || '-';
  }

  formatEstado(value: Vacuno['estado']): string {
    const normalized = String(value ?? '').toLowerCase();
    return normalized === 'muerto' ? 'Muerto' : 'Vivo';
  }

  isAlive(value: Vacuno['estado']): boolean {
    return String(value ?? '').toLowerCase() !== 'muerto';
  }

  onPhotoError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.fallbackPhotoUrl;
  }

  formatCatalogValue(value: string | undefined): string {
    if (!value) {
      return '';
    }

    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  observationsMeta(vacuno: Vacuno): string {
    const text = vacuno.observaciones ?? '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return `${words}/${this.maxObservationWords} palabras - ${text.length}/${this.maxObservationLength} caracteres`;
  }

  private startCreate(): void {
    this.isCreating.set(true);
    this.isEditing.set(true);
    this.selectedVacunoData.set(null);
    this.draftVacuno.set(this.createBlankVacuno());
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private loadVacunos(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.vacunosApi
      .search({
        search: this.searchTerm(),
        page: this.currentPage(),
        pageSize: this.pageSize(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.tableData.set(response.items);
          this.totalItems.set(response.totalItems);
        },
        error: () => {
          this.tableData.set([]);
          this.totalItems.set(0);
          this.errorMessage.set('No se pudo cargar el listado de vacunos.');
        },
      });
  }

  private loadOptions(): void {
    this.vacunosApi
      .getOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (options) => {
          this.adquisicionOptions.set(options.adquisicionOptions);
          this.razaOptions.set(options.razaOptions);
          this.sexoOptions.set(options.sexoOptions);
          this.aptoParaOptions.set(options.aptoParaOptions);
        },
      });
  }

  private saveDraft(): void {
    const draft = this.draftVacuno();

    if (!draft) {
      return;
    }

    const normalizedDraft = this.normalizeDraft(draft);
    const validationMessage = this.validateDraft(normalizedDraft);
    if (validationMessage) {
      this.errorMessage.set(validationMessage);
      return;
    }

    this.draftVacuno.set(normalizedDraft);

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.isCreating()) {
      this.vacunosApi
        .create({ vacuno: normalizedDraft, foto: this.selectedPhoto() })
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.loading.set(false)),
        )
        .subscribe({
          next: () => {
            this.successMessage.set('Vacuno registrado correctamente !');
            this.isCreating.set(false);
            this.selectedVacunoData.set(null);
            this.draftVacuno.set(null);
            this.selectedPhoto.set(null);
            this.photoPreviewUrl.set(null);
            this.loadVacunos();
            void this.router.navigate(['/vacunos']);
          },
          error: (error) => {
            this.errorMessage.set(this.extractErrorMessage(error, 'No se pudo registrar el vacuno.'));
          },
        });
      return;
    }

    this.vacunosApi
      .update(normalizedDraft.codigo, { vacuno: normalizedDraft, foto: this.selectedPhoto() })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (updated) => {
          this.tableData.update((data) =>
            data.map((vacuno) => (vacuno.codigo === updated.codigo ? updated : vacuno)),
          );
          this.successMessage.set('Se actualizó correctamente !');
          this.selectedVacunoData.set(null);
          this.draftVacuno.set(null);
          this.selectedPhoto.set(null);
          this.photoPreviewUrl.set(null);
          this.isEditing.set(false);
          this.loadVacunos();
          void this.router.navigate(['/vacunos']);
        },
        error: (error) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'No se pudieron guardar los cambios del vacuno.'));
        },
      });
  }

  private createBlankVacuno(): Vacuno {
    const today = new Date().toISOString().slice(0, 10);

    return {
      codigo: '',
      nombre: '',
      fechaNacimiento: today,
      adquisicionPor: 'monta',
      precioCompra: null,
      raza: 'Angus',
      color: '',
      sexo: 'hembra',
      codigoPadre: '',
      codigoMadre: '',
      granja: '',
      distrito: 'Tulumayo',
      departamento: 'Huanuco',
      provincia: 'Leoncio Prado',
      aptoPara: 'produccion_leche',
      fechaRegistroFuncion: today,
      observaciones: '',
      fotoUrl: null,
      estado: 'vivo',
    };
  }

  private validateDraft(vacuno: Vacuno): string | null {
    const requiredFields: Array<[keyof Vacuno, string]> = [
      ['codigo', 'codigo'],
      ['nombre', 'nombre'],
      ['fechaNacimiento', 'fecha de nacimiento'],
      ['adquisicionPor', 'adquisicion'],
      ['raza', 'raza'],
      ['color', 'color'],
      ['sexo', 'sexo'],
      ['codigoPadre', 'codigo padre'],
      ['codigoMadre', 'codigo madre'],
      ['granja', 'granja'],
      ['distrito', 'distrito'],
      ['departamento', 'departamento'],
      ['provincia', 'provincia'],
      ['aptoPara', 'apto para'],
      ['fechaRegistroFuncion', 'fecha de registro de funcion'],
    ];

    const missingField = requiredFields.find(([field]) => !String(vacuno[field] ?? '').trim());
    if (missingField) {
      return `El campo ${missingField[1]} es obligatorio.`;
    }

    if (vacuno.codigo.length > this.maxCodeLength) {
      return `El codigo debe tener como maximo ${this.maxCodeLength} caracteres.`;
    }

    if (vacuno.codigoPadre.length > this.maxCodeLength || vacuno.codigoMadre.length > this.maxCodeLength) {
      return `Los codigos de trazabilidad deben tener como maximo ${this.maxCodeLength} caracteres.`;
    }

    const textFields: Array<[keyof Vacuno, string]> = [
      ['nombre', 'nombre'],
      ['raza', 'raza'],
      ['color', 'color'],
      ['sexo', 'sexo'],
      ['granja', 'granja'],
      ['distrito', 'distrito'],
      ['departamento', 'departamento'],
      ['provincia', 'provincia'],
    ];
    const tooLongField = textFields.find(([field]) => String(vacuno[field] ?? '').length > this.maxTextLength);
    if (tooLongField) {
      return `El campo ${tooLongField[1]} debe tener como maximo ${this.maxTextLength} caracteres.`;
    }

    if (!/^[A-Z0-9_-]+$/.test(vacuno.codigo)) {
      return 'El codigo debe estar en mayusculas y solo puede contener letras, numeros, guion o guion bajo.';
    }

    if (!/^[A-Z0-9_-]+$/.test(vacuno.codigoPadre) || !/^[A-Z0-9_-]+$/.test(vacuno.codigoMadre)) {
      return 'Los codigos de trazabilidad deben estar en mayusculas y solo pueden contener letras, numeros, guion o guion bajo.';
    }

    if (
      vacuno.adquisicionPor.toLowerCase() === 'compra'
      && (!vacuno.precioCompra || !Number.isFinite(vacuno.precioCompra) || vacuno.precioCompra <= 0)
    ) {
      return 'El precio de compra es obligatorio y debe ser mayor a 0 cuando la adquisicion es compra.';
    }

    if (this.isCreating() && this.tableData().some((item) => item.codigo.toUpperCase() === vacuno.codigo.toUpperCase())) {
      return `Ya existe un vacuno con el codigo ${vacuno.codigo}.`;
    }

    const observationWords = vacuno.observaciones.trim()
      ? vacuno.observaciones.trim().split(/\s+/).length
      : 0;

    if (vacuno.observaciones.length > this.maxObservationLength || observationWords > this.maxObservationWords) {
      return `Las observaciones no pueden exceder ${this.maxObservationWords} palabras o ${this.maxObservationLength} caracteres.`;
    }

    return null;
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    const response = error as { error?: { error?: { message?: string }; message?: string } };
    return response.error?.error?.message ?? response.error?.message ?? fallback;
  }

  private applyColumnFilters(vacunos: Vacuno[]): Vacuno[] {
    const filters = this.columnFilters();
    const normalize = (value: string) => value.trim().toLowerCase();

    return vacunos.filter((vacuno) => {
      const fechaNacimiento = this.formatDate(vacuno.fechaNacimiento);
      const estado = this.formatEstado(vacuno.estado).toLowerCase();

      return (
        (!filters.codigo || normalize(vacuno.codigo).includes(normalize(filters.codigo)))
        && (!filters.fecha || normalize(vacuno.fechaNacimiento).includes(normalize(filters.fecha)) || normalize(fechaNacimiento).includes(normalize(filters.fecha)))
        && (!filters.nombre || normalize(vacuno.nombre).includes(normalize(filters.nombre)))
        && (!filters.raza || normalize(vacuno.raza).includes(normalize(filters.raza)))
        && (!filters.procedencia || normalize(this.formatProcedencia(vacuno)).includes(normalize(filters.procedencia)))
        && (!filters.estado || estado === filters.estado)
      );
    });
  }

  private normalizeFieldValue(field: keyof Vacuno, value: string): string {
    const codeFields: Array<keyof Vacuno> = ['codigo', 'codigoPadre', 'codigoMadre'];

    if (codeFields.includes(field)) {
      return value.toUpperCase().slice(0, this.maxCodeLength);
    }

    if (field === 'observaciones') {
      return value.slice(0, this.maxObservationLength);
    }

    const limitedFields: Array<keyof Vacuno> = [
      'nombre',
      'raza',
      'color',
      'sexo',
      'granja',
      'distrito',
      'departamento',
      'provincia',
    ];

    return limitedFields.includes(field) ? value.slice(0, this.maxTextLength) : value;
  }

  private normalizeDraft(vacuno: Vacuno): Vacuno {
    return {
      ...vacuno,
      codigo: vacuno.codigo.trim().toUpperCase(),
      nombre: vacuno.nombre.trim(),
      adquisicionPor: vacuno.adquisicionPor.trim(),
      precioCompra: vacuno.adquisicionPor.toLowerCase() === 'compra' ? vacuno.precioCompra : null,
      raza: vacuno.raza.trim(),
      color: vacuno.color.trim(),
      sexo: vacuno.sexo.trim(),
      codigoPadre: vacuno.codigoPadre.trim().toUpperCase(),
      codigoMadre: vacuno.codigoMadre.trim().toUpperCase(),
      granja: vacuno.granja.trim(),
      distrito: vacuno.distrito.trim(),
      departamento: vacuno.departamento.trim(),
      provincia: vacuno.provincia.trim(),
      aptoPara: vacuno.aptoPara.trim(),
      observaciones: vacuno.observaciones.trim(),
    };
  }
}
