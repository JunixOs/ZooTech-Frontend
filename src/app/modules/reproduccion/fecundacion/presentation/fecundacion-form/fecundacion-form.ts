import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';

import { FecundacionFacade } from '../../application/fecundacion.facade';
import {
  FecundacionEdit,
  FecundacionOption,
  FecundacionVacunoOption,
  UpdateFecundacionRequest,
} from '../../domain/models/fecundacion.model';

@Component({
  selector: 'zt-fecundacion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe, PageHeaderComponent],
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

  textoBusquedaReceptor = '';
  textoBusquedaDonante = '';

  readonly mostrarDropdownReceptor = signal(false);
  readonly mostrarDropdownDonante = signal(false);

  readonly esEdicion = computed(() => this.fecundacionId() !== null);

  readonly receptoresFiltrados = computed(() => this.filtrarVacunos(this.receptores(), this.textoBusquedaReceptor));
  readonly donantesFiltrados = computed(() => this.filtrarVacunos(this.donantes(), this.textoBusquedaDonante));

  readonly form = this.fb.group({
    tipoFecundacionCode: ['', Validators.required],
    vacunoReceptorId: [null as number | null, Validators.required],
    vacunoDonanteId: [null as number | null],
    machoExterno: [false],
    fechaProcedimiento: [this.getTodayDateString(), [Validators.required, this.fechaNoFuturaValidator]],
    responsableNombre: ['', [Validators.required, Validators.maxLength(100)]],
    resultadoCode: ['', Validators.required],
    estadoFecundacionCode: [{ value: '', disabled: true }],
    observacionesVeterinarias: ['', Validators.maxLength(250)],
    codigoSemen: [''],
    codigoEmbrion: [''],
  });

  constructor() {
    this.form.controls.machoExterno.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isExterno) => this.configurarDonante(isExterno === true));

    this.form.controls.tipoFecundacionCode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => this.configurarCamposTecnica(tipo ?? ''));
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.fecundacionId.set(Number.isFinite(id) && id > 0 ? id : null);

    this.cargarOpciones();
    this.buscarReceptores();
    this.buscarDonantes();

    if (this.fecundacionId()) {
      this.cargarEdicion(this.fecundacionId()!);
    }
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
    this.form.patchValue({ vacunoDonanteId: toro.id });
    this.textoBusquedaDonante = `${toro.codigo} - ${toro.nombre}`;
    this.mostrarDropdownDonante.set(false);
  }

  guardar(): void {
    this.form.markAllAsTouched();
    this.validarDonanteExterno();

    if (this.form.invalid) {
      return;
    }

    const id = this.fecundacionId();
    if (!id) {
      this.errorServidor.set(this.translate.instant('reproduccion.fecundacion.form.errors.modoRegistroNoDisponible'));
      return;
    }

    const payload = this.buildPayload();

    this.guardando.set(true);
    this.errorServidor.set(null);
    this.advertencia.set(null);
    this.erroresCampo.set({});

    this.fecundacionFacade.actualizar(id, payload).subscribe({
      next: (response) => {
        this.guardando.set(false);
        if (response.warning) this.advertencia.set(response.warning);
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
      return this.translate.instant('reproduccion.fecundacion.form.errors.fechaFutura');
    }
    return this.translate.instant('reproduccion.fecundacion.form.errors.valorInvalido');
  }

  esTipoIA(): boolean {
    return this.matchesTipo(this.form.controls.tipoFecundacionCode.value, ['IA', 'INSEMINACION']);
  }

  esTipoTE(): boolean {
    return this.matchesTipo(this.form.controls.tipoFecundacionCode.value, ['TE', 'TRANSFERENCIA']);
  }

  private cargarOpciones(): void {
    this.fecundacionFacade.obtenerOpciones().subscribe({
      next: (opciones) => {
        this.tiposFecundacion.set(opciones.tipos);
        this.resultados.set(opciones.resultados);
        this.estados.set(opciones.estados);
      },
      error: (err) => this.errorServidor.set(this.getErrorMessage(err)),
    });
  }

  private cargarEdicion(id: number): void {
    this.cargando.set(true);
    this.fecundacionFacade.obtenerParaEditar(id).subscribe({
      next: (data) => {
        this.cargando.set(false);
        this.patchEdicion(data);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorServidor.set(this.getErrorMessage(err));
      },
    });
  }

  private patchEdicion(data: FecundacionEdit): void {
    const donor = this.resolveDonor(data);

    this.form.patchValue({
      tipoFecundacionCode: data.tipoFecundacion,
      vacunoReceptorId: data.vacunoReceptor.id,
      vacunoDonanteId: donor.interno?.id ?? null,
      machoExterno: data.machoExterno,
      fechaProcedimiento: data.fechaProcedimiento,
      responsableNombre: data.responsable,
      resultadoCode: data.resultado,
      estadoFecundacionCode: data.estadoFecundacion,
      observacionesVeterinarias: data.observaciones ?? '',
      codigoSemen: data.codigoSemen ?? '',
      codigoEmbrion: data.codigoEmbrion ?? '',
    });

    this.textoBusquedaReceptor = `${data.vacunoReceptor.codigo} - ${data.vacunoReceptor.nombre}`;
    this.textoBusquedaDonante = data.machoExterno
      ? donor.externo ?? ''
      : donor.interno
        ? `${donor.interno.codigo} - ${donor.interno.nombre}`
        : '';

    this.receptores.update((items) => this.mergeVacuno(items, {
      id: data.vacunoReceptor.id,
      codigo: data.vacunoReceptor.codigo,
      nombre: data.vacunoReceptor.nombre,
      sexo: 'hembra',
    }));

    if (donor.interno) {
      this.donantes.update((items) => this.mergeVacuno(items, {
        id: donor.interno!.id,
        codigo: donor.interno!.codigo,
        nombre: donor.interno!.nombre,
        sexo: 'macho',
      }));
    }
  }

  private buscarReceptores(q = ''): void {
    this.fecundacionFacade.buscarVacunos('hembra', q).subscribe({
      next: (items) => this.receptores.set(items),
      error: (err) => this.errorServidor.set(this.getErrorMessage(err)),
    });
  }

  private buscarDonantes(q = ''): void {
    this.fecundacionFacade.buscarVacunos('macho', q).subscribe({
      next: (items) => this.donantes.set(items),
      error: (err) => this.errorServidor.set(this.getErrorMessage(err)),
    });
  }

  private configurarDonante(isExterno: boolean): void {
    const donanteCtrl = this.form.controls.vacunoDonanteId;
    if (isExterno) {
      donanteCtrl.clearValidators();
      donanteCtrl.setValue(null);
      this.mostrarDropdownDonante.set(false);
    } else {
      donanteCtrl.setValidators(Validators.required);
    }
    donanteCtrl.updateValueAndValidity();
  }

  private configurarCamposTecnica(tipo: string): void {
    const semenCtrl = this.form.controls.codigoSemen;
    const embrionCtrl = this.form.controls.codigoEmbrion;

    semenCtrl.clearValidators();
    embrionCtrl.clearValidators();

    if (this.matchesTipo(tipo, ['IA', 'INSEMINACION'])) {
      semenCtrl.setValidators([Validators.required, Validators.maxLength(30)]);
      embrionCtrl.setValue('');
    } else if (this.matchesTipo(tipo, ['TE', 'TRANSFERENCIA'])) {
      embrionCtrl.setValidators([Validators.required, Validators.maxLength(30)]);
      semenCtrl.setValue('');
    } else {
      semenCtrl.setValue('');
      embrionCtrl.setValue('');
    }

    semenCtrl.updateValueAndValidity();
    embrionCtrl.updateValueAndValidity();
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
      responsable: raw.responsableNombre?.trim() ?? '',
      resultado: raw.resultadoCode ?? '',
      codigoSemen: raw.codigoSemen?.trim() || null,
      codigoEmbrion: raw.codigoEmbrion?.trim() || null,
      observaciones: raw.observacionesVeterinarias?.trim() || null,
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
      interno: {
        id: data.machoODonante.id,
        codigo: data.machoODonante.codigo,
        nombre: data.machoODonante.nombre,
        sexo: 'macho',
      },
      externo: null,
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

  private matchesTipo(value: string | null | undefined, candidates: string[]): boolean {
    const normalized = (value ?? '').toUpperCase();
    return candidates.some((candidate) => normalized.includes(candidate));
  }

  private fechaNoFuturaValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string | null;
    if (!value) return null;
    return value > FecundacionForm.getTodayDateStringStatic() ? { futureDate: true } : null;
  }

  private getErrorMessage(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    const maybeHttpError = err as { error?: { errorMessage?: string; message?: string } };
    return maybeHttpError.error?.errorMessage
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
