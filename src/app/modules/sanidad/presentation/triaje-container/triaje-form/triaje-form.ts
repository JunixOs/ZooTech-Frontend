import {ChangeDetectionStrategy,Component,computed,inject,input,output,effect,signal,} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ActualizarTriajePayload,
  RegistrarTriajePayload,
  TriajeHistorialItem,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
  Triaje,
} from '@modules/sanidad/domain/models/triaje.model';

export type TriajeFormMode = 'new' | 'view';
type TriajeFormControlName = 'fecha_hora' | 'vacunoId' | 'pesoKg' | 'tipoPesoCode' | 'observaciones';

@Component({
  selector: 'zt-triaje-form',
  imports: [ReactiveFormsModule, DatePipe, TranslatePipe],
  templateUrl: './triaje-form.html',
  styleUrl: './triaje-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeForm {
  private readonly formBuilder = inject(FormBuilder);

  triajeCode = input('');
  vacunos = input<TriajeVacunoOption[]>([]);
  tiposPeso = input<TriajeTipoPesoOption[]>([]);
  historial = input<TriajeHistorialItem[]>([]);
  mode = input<TriajeFormMode>('new');
  triajeData = input<Triaje | null>(null);

  cancelled = output<void>();
  saved = output<RegistrarTriajePayload>();
  edited = output<ActualizarTriajePayload>();
  deleted = output<number>();

  vacunoChange = output<number>();

  isEditing = signal(false);
  protected readonly submitted = signal(false);

  protected readonly isViewMode = computed(() => this.mode() === 'view');
  protected readonly title = computed(() => {
    return this.isViewMode()
      ? 'sanidad.triaje.form.title.viewDetail'
      : 'sanidad.triaje.form.title.new';
  });

  protected readonly form = this.formBuilder.nonNullable.group({
    fecha_hora: ['', Validators.required],
    vacunoId: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    pesoKg: ['', [
      Validators.required,
      Validators.pattern(/^\d+(\.\d{1,2})?$/),
      Validators.min(0.01),
    ]],
    tipoPesoCode: ['', Validators.required],
    observaciones: ['', Validators.maxLength(150)],
  });
  constructor() {
    this.form.controls.vacunoId.valueChanges.subscribe((value) => {
      if (!this.isViewMode() && value && value > 0) {
        this.vacunoChange.emit(value);
      }
    });

    effect(() => {
      const data = this.triajeData();
      if (data && this.isViewMode()) {
        this.isEditing.set(false);
        this.form.disable();
        this.form.patchValue({
          fecha_hora: data.fechaHora ? data.fechaHora.substring(0, 16) : '',
          vacunoId: data.vacunoId,
          pesoKg: String(data.pesoKg),
          tipoPesoCode: data.tipoPesoCode,
          observaciones: data.observaciones ?? '',
        });
        this.form.disable();
      } else {
        this.isEditing.set(false);
        this.submitted.set(false);
        this.form.enable();
        this.form.reset();
      }
    });
  }

  onCancel(): void {
    this.submitted.set(false);
    this.isEditing.set(false);
    this.form.reset();
    this.cancelled.emit();
  }

  startEdit(): void {
    this.isEditing.set(true);
    this.form.enable();
    this.form.controls.fecha_hora.disable();
    this.form.controls.vacunoId.disable();
  }
  onEdit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  }
  onSaveEdit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    if (raw.vacunoId === null || raw.pesoKg === '') {
      return;
    }
    const pesoKg = Number(raw.pesoKg);
    if (!Number.isFinite(pesoKg) || pesoKg <= 0) {
      return;
    }
    this.edited.emit({
      tipoPesoCode: raw.tipoPesoCode,
      pesoKg,
      observaciones: raw.observaciones || null,
      //estadoRegistroCode: 'ACTIVO',
      //encargadoUsuarioId: null,
    });
  }

  onDelete(): void {
    const data = this.triajeData();
    if (data) this.deleted.emit(data.id);
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.vacunoId === null || raw.pesoKg === '') {
      return;
    }
    const pesoKg = Number(raw.pesoKg);
    if (!Number.isFinite(pesoKg) || pesoKg <= 0) {
      return;
    }

    this.saved.emit({
      fechaHora: raw.fecha_hora,
      vacunoId: raw.vacunoId,
      tipoPesoCode: raw.tipoPesoCode,
      pesoKg,
      observaciones: raw.observaciones || null,
      //Checar 
      estadoRegistroCode: 'ACTIVO',
      encargadoUsuarioId: null,
    });
  }

  protected isControlInvalid(controlName: TriajeFormControlName): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  protected controlHasError(controlName: TriajeFormControlName, errorName: string): boolean {
    return this.isControlInvalid(controlName) && this.form.controls[controlName].hasError(errorName);
  }

  protected onPesoKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const allowedKeys = new Set([
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]);

    if (allowedKeys.has(event.key)) {
      return;
    }

    if (event.key.length !== 1) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;
    const nextValue = this.getNextPesoValue(input, event.key);
    if (!this.isPotentialPesoValue(nextValue)) {
      event.preventDefault();
    }
  }

  protected onPesoPaste(event: ClipboardEvent): void {
    const input = event.target as HTMLInputElement;
    const pasted = event.clipboardData?.getData('text') ?? '';
    const nextValue = this.getNextPesoValue(input, pasted);

    if (!this.isPotentialPesoValue(nextValue)) {
      event.preventDefault();
    }
  }

  protected onPesoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = this.sanitizePesoValue(input.value);

    if (input.value !== sanitized) {
      input.value = sanitized;
      this.form.controls.pesoKg.setValue(sanitized);
    }
  }

  private getNextPesoValue(input: HTMLInputElement, insertedValue: string): string {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    return `${input.value.slice(0, start)}${insertedValue}${input.value.slice(end)}`;
  }

  private isPotentialPesoValue(value: string): boolean {
    return /^\d*(\.\d{0,2})?$/.test(value);
  }

  private sanitizePesoValue(value: string): string {
    const onlyValidCharacters = value.replace(/[^\d.]/g, '');
    const [integerPart, ...decimalParts] = onlyValidCharacters.split('.');
    const decimalPart = decimalParts.join('').slice(0, 2);

    return decimalParts.length > 0 ? `${integerPart}.${decimalPart}` : integerPart;
  }
}
