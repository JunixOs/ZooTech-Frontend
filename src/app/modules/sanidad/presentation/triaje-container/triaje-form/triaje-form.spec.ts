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
});
