import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TriajeForm } from './triaje-form';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('TriajeForm', () => {
  let component: TriajeForm;
  let fixture: ComponentFixture<TriajeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriajeForm],
      providers: [
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TriajeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marca peso como invalido cuando contiene letras', () => {
    const form = (component as any).form;

    form.controls.pesoKg.setValue('abc');

    expect(form.controls.pesoKg.invalid).toBe(true);
    expect(form.controls.pesoKg.hasError('pattern')).toBe(true);
  });

  it('bloquea caracteres no numericos en el campo peso', () => {
    const input = fixture.nativeElement.querySelector('#pesoKg') as HTMLInputElement;
    const letterEvent = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
    const minusEvent = new KeyboardEvent('keydown', { key: '-', cancelable: true });
    const digitEvent = new KeyboardEvent('keydown', { key: '5', cancelable: true });

    expect(input.dispatchEvent(letterEvent)).toBe(false);
    expect(input.dispatchEvent(minusEvent)).toBe(false);
    expect(input.dispatchEvent(digitEvent)).toBe(true);
  });

  it('muestra errores visuales para campos obligatorios al intentar registrar vacio', () => {
    component.onSubmit();
    fixture.detectChanges();

    const errorMessages = fixture.nativeElement.querySelectorAll('.error-message');

    expect((component as any).form.invalid).toBe(true);
    expect(errorMessages.length).toBeGreaterThanOrEqual(4);
  });

  it('emite saved con peso numerico cuando el formulario de creacion es valido', () => {
    const savedSpy = vi.fn();
    component.saved.subscribe(savedSpy);
    const form = (component as any).form;
    form.setValue({
      fecha_hora: '2026-07-22T10:30',
      vacunoId: 5,
      pesoKg: '120.5',
      tipoPesoCode: 'CONTROL',
      observaciones: '',
    });

    component.onSubmit();

    expect(savedSpy).toHaveBeenCalledOnce();
    expect(savedSpy).toHaveBeenCalledWith({
      fechaHora: '2026-07-22T10:30',
      vacunoId: 5,
      tipoPesoCode: 'CONTROL',
      pesoKg: 120.5,
      observaciones: null,
      estadoRegistroCode: 'ACTIVO',
      encargadoUsuarioId: null,
    });
  });

  it('cancelar cierra el flujo sin emitir guardado', () => {
    const cancelledSpy = vi.fn();
    const savedSpy = vi.fn();
    component.cancelled.subscribe(cancelledSpy);
    component.saved.subscribe(savedSpy);

    component.onCancel();

    expect(cancelledSpy).toHaveBeenCalledOnce();
    expect(savedSpy).not.toHaveBeenCalled();
  });

  it('en modo vista carga datos y deshabilita el formulario', () => {
    fixture.componentRef.setInput('mode', 'view');
    fixture.componentRef.setInput('triajeData', {
      id: 10,
      codigo: 'TRI-010',
      fechaHora: '2026-07-22T10:30:00',
      vacunoId: 5,
      tipoPesoCode: 'CONTROL',
      pesoKg: 130,
      observaciones: 'Detalle',
    });
    fixture.detectChanges();
    const form = (component as any).form;

    expect(form.disabled).toBe(true);
    expect(form.getRawValue()).toEqual({
      fecha_hora: '2026-07-22T10:30',
      vacunoId: 5,
      pesoKg: '130',
      tipoPesoCode: 'CONTROL',
      observaciones: 'Detalle',
    });
  });

  it('startEdit habilita edicion manteniendo fecha y vacuno deshabilitados', () => {
    fixture.componentRef.setInput('mode', 'view');
    fixture.componentRef.setInput('triajeData', {
      id: 10,
      codigo: 'TRI-010',
      fechaHora: '2026-07-22T10:30:00',
      vacunoId: 5,
      tipoPesoCode: 'CONTROL',
      pesoKg: 130,
    });
    fixture.detectChanges();
    const form = (component as any).form;

    component.startEdit();

    expect(component.isEditing()).toBe(true);
    expect(form.controls.fecha_hora.disabled).toBe(true);
    expect(form.controls.vacunoId.disabled).toBe(true);
    expect(form.controls.pesoKg.enabled).toBe(true);
    expect(form.controls.tipoPesoCode.enabled).toBe(true);
  });

  it('onSaveEdit emite edited cuando el formulario de edicion es valido', () => {
    const editedSpy = vi.fn();
    component.edited.subscribe(editedSpy);
    const form = (component as any).form;
    form.setValue({
      fecha_hora: '2026-07-22T10:30',
      vacunoId: 5,
      pesoKg: '131.25',
      tipoPesoCode: 'CONTROL',
      observaciones: '',
    });

    component.onSaveEdit();

    expect(editedSpy).toHaveBeenCalledWith({
      tipoPesoCode: 'CONTROL',
      pesoKg: 131.25,
      observaciones: null,
    });
  });

  it('onDelete emite el id del triaje en vista', () => {
    const deletedSpy = vi.fn();
    component.deleted.subscribe(deletedSpy);
    fixture.componentRef.setInput('mode', 'view');
    fixture.componentRef.setInput('triajeData', {
      id: 15,
      codigo: 'TRI-015',
      fechaHora: '2026-07-22T10:30:00',
      vacunoId: 5,
      tipoPesoCode: 'CONTROL',
      pesoKg: 130,
    });
    fixture.detectChanges();

    component.onDelete();

    expect(deletedSpy).toHaveBeenCalledWith(15);
  });

  it('bloquea paste invalido en el campo peso', () => {
    const input = fixture.nativeElement.querySelector('#pesoKg') as HTMLInputElement;
    const pasteEvent = new Event('paste', { cancelable: true });
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: { getData: () => '12a.3' },
    });

    expect(input.dispatchEvent(pasteEvent)).toBe(false);
  });

  it('sanitiza input de peso dejando solo decimales validos', () => {
    const input = fixture.nativeElement.querySelector('#pesoKg') as HTMLInputElement;
    const form = (component as any).form;
    input.value = '12a.3b45';

    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('12.34');
    expect(form.controls.pesoKg.value).toBe('12.34');
  });

  it('marca observaciones como invalido cuando excede 150 caracteres', () => {
    const form = (component as any).form;

    form.controls.observaciones.setValue('x'.repeat(151));

    expect(form.controls.observaciones.invalid).toBe(true);
    expect(form.controls.observaciones.hasError('maxlength')).toBe(true);
  });

  it('emite vacunoChange solo en modo nuevo', () => {
    const spy = vi.fn();
    component.vacunoChange.subscribe(spy);
    const form = (component as any).form;

    form.controls.vacunoId.setValue(8);
    expect(spy).toHaveBeenCalledWith(8);

    spy.mockClear();
    fixture.componentRef.setInput('mode', 'view');
    fixture.detectChanges();
    form.controls.vacunoId.setValue(9);

    expect(spy).not.toHaveBeenCalled();
  });
});
