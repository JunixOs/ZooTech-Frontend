import {
  Component, OnInit, OnChanges,
  input, output, signal, computed, inject, DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VacunoService } from '../../application/services/vacuno.service';
import { VacunoDetalle, RegistrarVacunoRequest, EditarVacunoRequest, AdquisicionPor, SexoVacuno, AptoPara } from '../../domain/models/vacuno.model';

function soloMayusculas(c: AbstractControl): ValidationErrors | null {
  const v: string = c.value ?? '';
  return !v || /^[A-Z0-9]+$/.test(v) ? null : { soloMayusculas: true };
}

function obsValidator(c: AbstractControl): ValidationErrors | null {
  const v: string = c.value ?? '';
  if (!v) return null;
  if (v.length > 150) return { maxCaracteres: true };
  if (v.trim().split(/\s+/).filter(Boolean).length > 30) return { maxPalabras: true };
  return null;
}

@Component({
  selector: 'app-vacuno-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vacuno-form.html',
  styleUrl: './vacuno-form.scss',
})
export class VacunoFormComponent implements OnInit, OnChanges {

  readonly modoEdicion = input(false);
  readonly vacunoDetalle = input<VacunoDetalle | null>(null);
  readonly onCancelar = output<void>();
  readonly onGuardado = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(VacunoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly guardando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly erroresCampo = signal<Record<string, string>>({});
  readonly fotoPreview = signal<string | null>(null);
  readonly fotoNombre = signal<string | null>(null);
  private archivoFoto: File | null = null;

  readonly opcionesRaza = ['Jersey', 'Holstein', 'Angus', 'Hereford', 'Simmental', 'Brown Swiss', 'Brahman', 'Charolais'];
  readonly opcionesDepartamento = ['Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'];
  readonly opcionesProvincia = ['Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Huancayo', 'Cajamarca', 'Puno', 'Tacna', 'Ica', 'Chimbote', 'Ayacucho', 'Oxapampa', 'Tocache', 'Tarapoto'];
  readonly opcionesDistrito = ['Miraflores', 'San Isidro', 'Surco', 'Barranco', 'San Borja', 'La Molina', 'Cusco', 'Wanchaq', 'Arequipa', 'El Tambo', 'Huancayo', 'Trujillo', 'La Esperanza', 'El Porvenir', 'Tocache', 'Uchiza', 'Puerto Sungaro', 'Tulumayo'];

  form!: FormGroup;

  readonly esCompra = computed(() => this.form?.get('adquisicionPor')?.value === 'compra');

  ngOnInit(): void {
    this._buildForm();
    this.form.get('adquisicionPor')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo: AdquisicionPor) => {
        const ctrl = this.form.get('precioCompra')!;
        tipo === 'compra'
          ? ctrl.setValidators([Validators.required, Validators.min(0.01)])
          : ctrl.clearValidators();
        ctrl.setValue(null);
        ctrl.updateValueAndValidity();
      });
  }

  ngOnChanges(): void {
    if (this.form && this.modoEdicion() && this.vacunoDetalle()) {
      const v = this.vacunoDetalle()!;
      this.form.patchValue({ ...v, observaciones: v.observaciones ?? '' });
      this.form.get('codigo')!.disable();
      this.form.get('fechaNacimiento')!.disable();
      this.form.get('adquisicionPor')!.disable();
      if (v.fotoUrl) { this.fotoPreview.set(v.fotoUrl); this.fotoNombre.set('Foto actual'); }
    }
  }

  private _buildForm(): void {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(10), soloMayusculas]],
      nombre: ['', [Validators.required, Validators.maxLength(15)]],
      fechaNacimiento: ['', Validators.required],
      adquisicionPor: ['monta' as AdquisicionPor, Validators.required],
      precioCompra: [null as number | null],
      raza: ['Jersey', Validators.required],
      color: ['', [Validators.required, Validators.maxLength(15)]],
      sexo: ['hembra' as SexoVacuno, Validators.required],
      codigoPadre: ['', [Validators.required, Validators.maxLength(10), soloMayusculas]],
      codigoMadre: ['', [Validators.required, Validators.maxLength(10), soloMayusculas]],
      granja: ['', [Validators.required, Validators.maxLength(15)]],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      aptoPara: ['produccion_leche' as AptoPara, Validators.required],
      fechaEspecificacion: ['', Validators.required],
      observaciones: ['', obsValidator],
    });
  }

  onArchivoSeleccionado(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      this.erroresCampo.update(e => ({ ...e, foto: 'Solo PNG o JPG.' }));
      return;
    }
    this.archivoFoto = file;
    this.fotoNombre.set(file.name);
    this.erroresCampo.update(e => { const c = { ...e }; delete c['foto']; return c; });
    const r = new FileReader();
    r.onload = () => this.fotoPreview.set(r.result as string);
    r.readAsDataURL(file);
  }

  quitarFoto(): void { this.archivoFoto = null; this.fotoPreview.set(null); this.fotoNombre.set(null); }

  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.guardando.set(true);
    this.errorServidor.set(null);
    this.erroresCampo.set({});
    this.modoEdicion() ? this._editar() : this._registrar();
  }

  private _registrar(): void {
    const raw = this.form.getRawValue();
    const payload: RegistrarVacunoRequest = {
      codigo: raw.codigo, nombre: raw.nombre, fechaNacimiento: raw.fechaNacimiento,
      adquisicionPor: raw.adquisicionPor, raza: raw.raza, color: raw.color,
      sexo: raw.sexo, codigoPadre: raw.codigoPadre, codigoMadre: raw.codigoMadre,
      granja: raw.granja, distrito: raw.distrito, departamento: raw.departamento,
      provincia: raw.provincia, aptoPara: raw.aptoPara, fechaEspecificacion: raw.fechaEspecificacion,
      ...(raw.adquisicionPor === 'compra' && raw.precioCompra != null ? { precioCompra: Number(raw.precioCompra) } : {}),
      ...(raw.observaciones?.trim() ? { observaciones: raw.observaciones.trim() } : {}),
      foto: this.archivoFoto,
    };
    this.svc.registrar(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.guardando.set(false); this.onGuardado.emit(); },
      error: (e) => this._handleError(e),
    });
  }

  private _editar(): void {
    const raw = this.form.getRawValue();
    const payload: EditarVacunoRequest = {
      nombre: raw.nombre, raza: raw.raza, color: raw.color, sexo: raw.sexo as SexoVacuno,
      granja: raw.granja, distrito: raw.distrito, departamento: raw.departamento,
      provincia: raw.provincia, aptoPara: raw.aptoPara as AptoPara,
      fechaEspecificacion: raw.fechaEspecificacion,
      ...(raw.precioCompra != null ? { precioCompra: Number(raw.precioCompra) } : {}),
      ...(raw.observaciones?.trim() ? { observaciones: raw.observaciones.trim() } : {}),
      foto: this.archivoFoto,
    };
    this.svc.editar(this.vacunoDetalle()!.id, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.guardando.set(false); this.onGuardado.emit(); },
      error: (e) => this._handleError(e),
    });
  }

  private _handleError(err: unknown): void {
    this.guardando.set(false);
    const apiErr = (err as any)?.error?.error;
    if (!apiErr) { this.errorServidor.set('Error inesperado. Intenta de nuevo.'); return; }
    if (apiErr.code === 'VACUNO_ALREADY_EXISTS') {
      this.erroresCampo.update(e => ({ ...e, codigo: apiErr.message })); return;
    }
    if (apiErr.code === 'VALIDATION_ERROR' && apiErr.details?.length) {
      const mapa: Record<string, string> = {};
      for (const d of apiErr.details) mapa[this._mapCampo(d.field)] = d.message;
      this.erroresCampo.set(mapa);
    } else { this.errorServidor.set(apiErr.message ?? 'Error del servidor.'); }
  }

  private _mapCampo(f: string): string {
    const m: Record<string, string> = {
      Codigo: 'codigo', Nombre: 'nombre', FechaNacimiento: 'fechaNacimiento',
      AdquisicionPor: 'adquisicionPor', PrecioCompra: 'precioCompra',
      Raza: 'raza', Color: 'color', Sexo: 'sexo',
      CodigoPadre: 'codigoPadre', CodigoMadre: 'codigoMadre',
      Granja: 'granja', NombreGranja: 'granja',
      Distrito: 'distrito', Departamento: 'departamento', Provincia: 'provincia',
      AptoPara: 'aptoPara', FechaEspecificacion: 'fechaEspecificacion', Observaciones: 'observaciones',
    };
    return m[f] ?? f.charAt(0).toLowerCase() + f.slice(1);
  }

  campoInvalido(n: string): boolean {
    const c = this.form.get(n);
    return !!(c?.invalid && (c.dirty || c.touched));
  }

  mensajeError(n: string): string {
    const srv = this.erroresCampo()[n];
    if (srv) return srv;
    const e = this.form.get(n)?.errors;
    if (!e) return '';
    if (e['required']) return 'Campo obligatorio.';
    if (e['maxlength']) return `Máx. ${e['maxlength'].requiredLength} caracteres.`;
    if (e['soloMayusculas']) return 'Solo mayúsculas y números.';
    if (e['min']) return 'Debe ser mayor a 0.';
    if (e['maxCaracteres']) return 'Máx. 150 caracteres.';
    if (e['maxPalabras']) return 'Máx. 30 palabras.';
    return 'Valor inválido.';
  }

  forzarMayusculas(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.form.get(campo)?.setValue(upper, { emitEvent: false });
    input.value = upper;
  }

  soloNumerosDecimales(event: KeyboardEvent): void {
    const sys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (sys.includes(event.key)) return;
    if (!/^[0-9.]$/.test(event.key)) { event.preventDefault(); return; }
    if (event.key === '.' && (event.target as HTMLInputElement).value.includes('.')) event.preventDefault();
  }

  cancelar(): void { this.onCancelar.emit(); }
}
