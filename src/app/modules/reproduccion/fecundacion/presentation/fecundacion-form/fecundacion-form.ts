import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { BackButtonComponent } from '@shared/components/back-button/back-button';
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  switchMap,
} from 'rxjs';

import { FecundacionFacade } from '../../application/facades/fecundacion.facade';
import {
  CreateFecundacionResponse,
  FecundacionEdit,
  FecundacionOption,
  FecundacionUpdateResponse,
  FecundacionVacunoOption,
  FecundacionVacunoResumen,
  UpdateFecundacionRequest,
} from '../../domain/models/fecundacion.model';

@Component({
  selector: 'zt-fecundacion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    PageHeaderComponent,
    BackButtonComponent
  ],
  templateUrl: './fecundacion-form.html',
  styleUrl: './fecundacion-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly fecundacionFacade = inject(FecundacionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly guardando = signal(false);
  readonly cargando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly advertencia = signal<string | null>(null);
  readonly erroresCampo = signal<Record<string, string>>({});
  readonly tiposFecundacion = signal<FecundacionOption[]>([]);
  readonly resultados = signal<FecundacionOption[]>([]);
  readonly estados = signal<FecundacionOption[]>([]);
  readonly receptores = signal<FecundacionVacunoOption[]>([]);
  readonly donantes = signal<FecundacionVacunoOption[]>([]);
  readonly fecundacionId = signal<number | null>(null);
  readonly codigoFecundacion = signal('');
  readonly tipoFecundacionActual = signal<string>('');
  private readonly receptorSeleccionado = signal<FecundacionVacunoOption | null>(null);
  private readonly donanteSeleccionado = signal<FecundacionVacunoOption | null>(null);
  private readonly busquedaReceptor = new Subject<string>();
  private readonly busquedaDonante = new Subject<string>();

  textoBusquedaReceptor = '';
  textoBusquedaDonante = '';

  readonly mostrarDropdownReceptor = signal(false);
  readonly mostrarDropdownDonante = signal(false);

  readonly esEdicion = computed(() => this.fecundacionId() !== null);

  readonly receptoresFiltrados = computed(() => this.filtrarVacunos(this.receptores(), this.textoBusquedaReceptor));
  readonly donantesFiltrados = computed(() => this.filtrarVacunos(this.donantes(), this.textoBusquedaDonante));

  readonly esTipoIA = computed(() => this.matchesTipo(this.tipoFecundacionActual(), ['IA', 'INSEMINACION']));
  readonly esTipoTE = computed(() => this.matchesTipo(this.tipoFecundacionActual(), ['TE', 'TRANSFERENCIA']));

  readonly form = this.fb.group({
    tipoFecundacionCode: ['', Validators.required],
    vacunoReceptorId: [null as number | null, Validators.required],
    vacunoDonanteId: [null as number | null],
    machoExterno: [false],
    fechaProcedimiento: [this.getTodayDateString(), [Validators.required, this.fechaNoFuturaValidator]],
    responsableName: ['', [Validators.required, Validators.maxLength(100)]],
    resultadoCode: ['', Validators.required],
    estadoFecundacionCode: [''],
    observaciones: ['', Validators.maxLength(250)],
    codigoSemen: [{ value: '', disabled: true }],
    codigoEmbrion: [{ value: '', disabled: true }],
  });

  constructor() {
    this.form.controls.machoExterno.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isExterno) => this.configurarDonante(isExterno === true));

    this.form.controls.tipoFecundacionCode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => {
        this.tipoFecundacionActual.set(tipo ?? '');
        this.configurarCamposTecnica(tipo ?? '');
      });

    this.configurarBusquedas();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.fecundacionId.set(Number.isFinite(id) && id > 0 ? id : null);

    const fecundacionId = this.fecundacionId();
    if (fecundacionId) this.cargarFormularioEdicion(fecundacionId);
    else this.cargarFormularioRegistro();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.buscador-container')) {
      this.mostrarDropdownReceptor.set(false);
      this.mostrarDropdownDonante.set(false);
    }
  }

  onBusquedaReceptorChange(): void {
    this.mostrarDropdownReceptor.set(true);
    this.receptorSeleccionado.set(null);
    this.form.patchValue({ vacunoReceptorId: null });
    this.buscarReceptores(this.textoBusquedaReceptor);
  }

  toggleDropdownReceptor(event: Event): void {
    event.stopPropagation();
    this.mostrarDropdownReceptor.update((visible) => !visible);
    this.mostrarDropdownDonante.set(false);
    if (this.mostrarDropdownReceptor()) this.buscarReceptores(this.textoBusquedaReceptor);
  }

  seleccionarReceptor(vaca: FecundacionVacunoOption): void {
    this.receptorSeleccionado.set(vaca);
    this.form.patchValue({ vacunoReceptorId: vaca.id });
    this.textoBusquedaReceptor = `${vaca.codigo} - ${vaca.nombre}`;
    this.mostrarDropdownReceptor.set(false);
  }

  onBusquedaDonanteChange(): void {
    if (this.form.controls.machoExterno.value) {
      if (this.textoBusquedaDonante.trim()) {
        this.form.controls.vacunoDonanteId.setErrors(null);
      }
      return;
    }

    this.mostrarDropdownDonante.set(true);
    this.donanteSeleccionado.set(null);
    this.form.patchValue({ vacunoDonanteId: null });
    this.buscarDonantes(this.textoBusquedaDonante);
  }

  toggleDropdownDonante(event: Event): void {
    event.stopPropagation();
    if (this.form.controls.machoExterno.value) return;

    this.mostrarDropdownDonante.update((visible) => !visible);
    this.mostrarDropdownReceptor.set(false);
    if (this.mostrarDropdownDonante()) this.buscarDonantes(this.textoBusquedaDonante);
  }

  seleccionarDonante(toro: FecundacionVacunoOption): void {
    this.donanteSeleccionado.set(toro);
    this.form.patchValue({ vacunoDonanteId: toro.id });
    this.textoBusquedaDonante = `${toro.codigo} - ${toro.nombre}`;
    this.mostrarDropdownDonante.set(false);
  }

  guardar(): void {
    if (this.cargando() || this.guardando()) return;

    this.form.markAllAsTouched();
    this.validarDonanteExterno();

    if (this.form.invalid) {
      return;
    }

    const id = this.fecundacionId();
    const payload = this.buildPayload();

    this.guardando.set(true);
    this.errorServidor.set(null);
    this.advertencia.set(null);
    this.erroresCampo.set({});

    const request$: Observable<CreateFecundacionResponse | FecundacionUpdateResponse> = id
      ? this.fecundacionFacade.actualizar(id, payload)
      : this.fecundacionFacade.crear(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.guardando.set(false);
        if ('warning' in response && response.warning) this.advertencia.set(response.warning);
        void this.router.navigate(['/reproduccion/fecundacion']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorServidor.set(this.getErrorMessage(err));
      },
    });
  }

  cancelar(): void {
    void this.router.navigate(['/reproduccion/fecundacion']);
  }

  campoInvalido(name: string): boolean {
    const control = this.form.get(name);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  mensajeError(name: string): string {
    const serverMessage = this.erroresCampo()[name];
    if (serverMessage) return serverMessage;

    const control = this.form.get(name);
    if (control?.hasError('required')) {
      return this.translate.instant('reproduccion.fecundacion.form.errors.campoObligatorio');
    }
    if (control?.hasError('maxlength')) {
      return this.translate.instant('reproduccion.fecundacion.form.errors.maxCaracteres');
    }
    if (control?.hasError('futureDate')) {
      return 'La fecha del procedimiento no puede ser futura.';
    }
    return this.translate.instant('reproduccion.fecundacion.form.errors.valorInvalido');
  }


  private cargarFormularioEdicion(id: number): void {
    this.cargando.set(true);
    forkJoin({
      opciones: this.fecundacionFacade.obtenerOpciones(),
      detalle: this.fecundacionFacade.obtenerParaEditar(id),
      receptores: this.fecundacionFacade.buscarVacunos('hembra', '', true, id),
      donantes: this.fecundacionFacade.buscarVacunos('macho'),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ opciones, detalle, receptores, donantes }) => {
          this.aplicarOpciones(opciones);
          const receptor = this.toVacunoOption(detalle.vacunoReceptor, 'hembra');
          const donor = this.resolveDonor(detalle);
          this.receptorSeleccionado.set(receptor);
          this.donanteSeleccionado.set(donor.interno);
          this.receptores.set(this.mergeVacuno(receptores, receptor));
          this.donantes.set(
            donor.interno ? this.mergeVacuno(donantes, donor.interno) : donantes,
          );
          this.patchEdicion(detalle);
          this.cargando.set(false);
        },
        error: (err) => {
          this.cargando.set(false);
          this.errorServidor.set(this.getErrorMessage(err));
        },
      });
  }

  private cargarFormularioRegistro(): void {
    this.cargando.set(true);
    forkJoin({
      opciones: this.fecundacionFacade.obtenerOpciones(),
      receptores: this.fecundacionFacade.buscarVacunos('hembra', '', true),
      donantes: this.fecundacionFacade.buscarVacunos('macho'),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ opciones, receptores, donantes }) => {
          this.aplicarOpciones(opciones);
          this.receptores.set(receptores);
          this.donantes.set(donantes);
          this.cargando.set(false);
        },
        error: (err) => {
          this.cargando.set(false);
          this.errorServidor.set(this.getErrorMessage(err));
        },
      });
  }

  private patchEdicion(data: FecundacionEdit): void {
    const donor = this.resolveDonor(data);
    this.codigoFecundacion.set(data.codigo);

    this.form.patchValue({
      tipoFecundacionCode: data.tipoFecundacion,
      vacunoReceptorId: data.vacunoReceptor.id,
      vacunoDonanteId: donor.interno?.id ?? null,
      machoExterno: data.machoExterno,
      fechaProcedimiento: data.fechaProcedimiento,
      responsableName: data.responsable,
      resultadoCode: data.resultado,
      estadoFecundacionCode: data.estadoFecundacion || this.estadoInicialDisponible(),
      observaciones: data.observaciones ?? '',
      codigoSemen: data.codigoSemen ?? '',
      codigoEmbrion: data.codigoEmbrion ?? '',
    });

    this.textoBusquedaReceptor = `${data.vacunoReceptor.codigo} - ${data.vacunoReceptor.nombre}`;
    this.textoBusquedaDonante = data.machoExterno
      ? donor.externo ?? ''
      : donor.interno
        ? `${donor.interno.codigo} - ${donor.interno.nombre}`
        : '';

  }

  private buscarReceptores(q = ''): void {
    this.busquedaReceptor.next(q.trim());
  }

  private buscarDonantes(q = ''): void {
    this.busquedaDonante.next(q.trim());
  }

  private configurarDonante(isExterno: boolean): void {
    const donanteCtrl = this.form.controls.vacunoDonanteId;
    if (isExterno) {
      donanteCtrl.clearValidators();
      donanteCtrl.setValue(null);
      this.donanteSeleccionado.set(null);
      this.textoBusquedaDonante = '';
      this.mostrarDropdownDonante.set(false);
    } else {
      donanteCtrl.setValidators(Validators.required);
    }
    donanteCtrl.updateValueAndValidity();
  }

  private configurarCamposTecnica(tipo: string): void {
    const semenCtrl = this.form.controls.codigoSemen;
    const embrionCtrl = this.form.controls.codigoEmbrion;
    const isIA = this.matchesTipo(tipo, ['IA', 'INSEMINACION', 'INSEMINACION_ARTIFICIAL']);
    const isTE = this.matchesTipo(tipo, ['TE', 'TRANSFERENCIA', 'TRANSFERENCIA_EMBRION', 'TRANSFERENCIA_EMBRIONES']);

    semenCtrl.clearValidators();
    embrionCtrl.clearValidators();

    if (isIA) {
      semenCtrl.enable({ emitEvent: false });
      embrionCtrl.disable({ emitEvent: false });
      semenCtrl.setValidators([Validators.required, Validators.maxLength(30)]);
      embrionCtrl.setValue('', { emitEvent: false });
    } else if (isTE) {
      embrionCtrl.enable({ emitEvent: false });
      semenCtrl.disable({ emitEvent: false });
      embrionCtrl.setValidators([Validators.required, Validators.maxLength(30)]);
      semenCtrl.setValue('', { emitEvent: false });
    } else {
      semenCtrl.disable({ emitEvent: false });
      embrionCtrl.disable({ emitEvent: false });
      semenCtrl.setValue('', { emitEvent: false });
      embrionCtrl.setValue('', { emitEvent: false });
    }

    semenCtrl.updateValueAndValidity({ emitEvent: false });
    embrionCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private validarDonanteExterno(): void {
    if (this.form.controls.machoExterno.value && !this.textoBusquedaDonante.trim()) {
      this.form.controls.vacunoDonanteId.setErrors({ required: true });
    }
  }

  private buildPayload(): UpdateFecundacionRequest {
    const raw = this.form.getRawValue();
    const isExterno = raw.machoExterno === true;

    return {
      tipoFecundacion: raw.tipoFecundacionCode ?? '',
      vacunoReceptorId: raw.vacunoReceptorId!,
      machoODonante: isExterno ? this.textoBusquedaDonante.trim() : raw.vacunoDonanteId!,
      machoExterno: isExterno,
      fechaProcedimiento: raw.fechaProcedimiento ?? '',
      responsable: raw.responsableName?.trim() ?? '',
      resultado: raw.resultadoCode ?? '',
      estadoFecundacion: raw.estadoFecundacionCode || null,
      codigoSemen: raw.codigoSemen?.trim() || null,
      codigoEmbrion: raw.codigoEmbrion?.trim() || null,
      observaciones: raw.observaciones?.trim() || null,
    };
  }

  private resolveDonor(data: FecundacionEdit): {
    interno: FecundacionVacunoOption | null;
    externo: string | null;
  } {
    if (typeof data.machoODonante === 'string') {
      return { interno: null, externo: data.machoODonante };
    }

    return {
      interno: this.toVacunoOption(data.machoODonante),
      externo: null,
    };
  }

  private toVacunoOption(
    vacuno: FecundacionVacunoResumen,
    sexo: 'hembra' | 'macho' = 'macho',
  ): FecundacionVacunoOption {
    return {
      id: vacuno.id,
      codigo: vacuno.codigo,
      nombre: vacuno.nombre,
      sexo,
    };
  }

  private filtrarVacunos(items: FecundacionVacunoOption[], term: string): FecundacionVacunoOption[] {
    const normalized = term.toLowerCase().trim();
    if (!normalized) return items;
    return items.filter(
      (v) => v.codigo.toLowerCase().includes(normalized) || v.nombre.toLowerCase().includes(normalized),
    );
  }

  private mergeVacuno(
    items: FecundacionVacunoOption[],
    vacuno: FecundacionVacunoOption,
  ): FecundacionVacunoOption[] {
    return items.some((item) => item.id === vacuno.id) ? items : [vacuno, ...items];
  }

  private aplicarOpciones(opciones: {
    tipos: FecundacionOption[];
    resultados: FecundacionOption[];
    estados: FecundacionOption[];
  }): void {
    this.tiposFecundacion.set(opciones.tipos);
    this.resultados.set(opciones.resultados);
    this.estados.set(opciones.estados);
  }

  private estadoInicialDisponible(): string {
    return this.estados()
      .find((estado) => this.normalizeTipo(estado.code) === 'EN_ESPERA')
      ?.code ?? '';
  }

  private configurarBusquedas(): void {
    this.busquedaReceptor
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((query) =>
          this.fecundacionFacade
            .buscarVacunos('hembra', query, true, this.fecundacionId())
            .pipe(
              catchError((err) => {
                this.errorServidor.set(this.getErrorMessage(err));
                return EMPTY;
              }),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => {
        const selected = this.receptorSeleccionado();
        this.receptores.set(selected ? this.mergeVacuno(items, selected) : items);
      });

    this.busquedaDonante
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((query) =>
          this.fecundacionFacade.buscarVacunos('macho', query).pipe(
            catchError((err) => {
              this.errorServidor.set(this.getErrorMessage(err));
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => {
        const selected = this.donanteSeleccionado();
        this.donantes.set(selected ? this.mergeVacuno(items, selected) : items);
      });
  }

  private matchesTipo(value: string | null | undefined, candidates: string[]): boolean {
    const normalized = this.normalizeTipo(value);
    return candidates.some((candidate) => normalized.includes(this.normalizeTipo(candidate)));
  }

  private normalizeTipo(value: string | null | undefined): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toUpperCase();
  }

  private fechaNoFuturaValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string | null;
    if (!value) return null;
    return value > FecundacionForm.getTodayDateStringStatic() ? { futureDate: true } : null;
  }

  private getErrorMessage(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    const maybeHttpError = err as { error?: { errorMessage?: string; message?: string; error?: { message?: string } } };
    return maybeHttpError.error?.errorMessage
      ?? maybeHttpError.error?.error?.message
      ?? maybeHttpError.error?.message
      ?? this.translate.instant('reproduccion.fecundacion.form.errors.guardarFailed');
  }

  private getTodayDateString(): string {
    return FecundacionForm.getTodayDateStringStatic();
  }

  private static getTodayDateStringStatic(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
