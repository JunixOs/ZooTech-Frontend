import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { describe, expect, it } from 'vitest';

import { VacunoDetailFieldComponent } from './vacuno-detail-field';

describe('VacunoDetailFieldComponent', () => {
  it('muestra etiqueta, valor e icono', () => {
    TestBed.configureTestingModule({
      imports: [VacunoDetailFieldComponent],
      providers: [provideTranslateService()],
    });

    const fixture = TestBed.createComponent(VacunoDetailFieldComponent);
    fixture.componentRef.setInput('labelKey', 'vacunos.detail.fields.codigo');
    fixture.componentRef.setInput('value', 'VAC-3597');
    fixture.componentRef.setInput('icon', 'fa-solid fa-calendar-days');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span').textContent).toContain(
      'vacunos.detail.fields.codigo',
    );
    expect(fixture.nativeElement.querySelector('strong').textContent).toContain('VAC-3597');
    expect(fixture.nativeElement.querySelector('i.fa-calendar-days')).toBeTruthy();
  });

  it('muestra el valor vacio configurado', () => {
    TestBed.configureTestingModule({
      imports: [VacunoDetailFieldComponent],
      providers: [provideTranslateService()],
    });

    const fixture = TestBed.createComponent(VacunoDetailFieldComponent);
    fixture.componentRef.setInput('labelKey', 'vacunos.detail.fields.codigoPadre');
    fixture.componentRef.setInput('value', null);
    fixture.componentRef.setInput('emptyValue', '-');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('strong').textContent.trim()).toBe('-');
  });
});
