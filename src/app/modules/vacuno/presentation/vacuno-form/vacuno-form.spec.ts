import { FormControl } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VacunoFormComponent, obsValidator, soloMayusculas } from './vacuno-form';

describe('VacunoFormComponent', () => {
  let fixture: ComponentFixture<VacunoFormComponent>;
  let component: VacunoFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacunoFormComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(VacunoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marca obligatorios y longitudes maximas del formulario', () => {
    component.form.patchValue({
      codigo: '',
      nombre: 'NombreDemasiadoLargo',
      color: 'ColorDemasiadoLargo',
      granja: 'GranjaDemasiadoLarga',
    });

    expect(component.form.get('codigo')?.hasError('required')).toBe(true);
    expect(component.form.get('nombre')?.hasError('maxlength')).toBe(true);
    expect(component.form.get('color')?.hasError('maxlength')).toBe(true);
    expect(component.form.get('granja')?.hasError('maxlength')).toBe(true);
  });

  it('valida codigos en mayusculas y maximo 10 caracteres', () => {
    expect(soloMayusculas(new FormControl('VACA001'))).toBeNull();
    expect(soloMayusculas(new FormControl('vaca001'))).toEqual({ soloMayusculas: true });

    component.form.get('codigo')?.setValue('VACUNO12345');

    expect(component.form.get('codigo')?.hasError('maxlength')).toBe(true);
  });

  it('activa precio compra solo cuando adquisicion es compra', () => {
    component.form.get('adquisicionPor')?.setValue('compra');
    component.form.get('precioCompra')?.setValue(null);

    expect(component.esCompra()).toBe(true);
    expect(component.form.get('precioCompra')?.hasError('required')).toBe(true);

    component.form.get('precioCompra')?.setValue(100);

    expect(component.form.get('precioCompra')?.valid).toBe(true);

    component.form.get('adquisicionPor')?.setValue('monta');

    expect(component.esCompra()).toBe(false);
    expect(component.form.get('precioCompra')?.validator).toBeNull();
  });

  it('valida observaciones con 150 caracteres y 30 palabras', () => {
    expect(obsValidator(new FormControl('texto valido'))).toBeNull();
    expect(obsValidator(new FormControl('a'.repeat(151)))).toEqual({ maxCaracteres: true });

    const muchasPalabras = Array.from({ length: 31 }, () => 'a').join(' ');

    expect(obsValidator(new FormControl(muchasPalabras))).toEqual({ maxPalabras: true });
  });

  it('rechaza imagen con formato no permitido', () => {
    const file = new File(['contenido'], 'foto.gif', { type: 'image/gif' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });

    component.onArchivoSeleccionado({ target: input } as unknown as Event);

    expect(component.erroresCampo()['foto']).toBe('Solo PNG o JPG.');
  });
});
