import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Triaje } from '@modules/sanidad/domain/models/triaje.model';
import { TriajeList } from './triaje-list';

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('TriajeList', () => {
  let component: TriajeList;
  let fixture: ComponentFixture<TriajeList>;

  const triaje: Triaje = {
    id: 1,
    codigo: 'TRI-001',
    fechaHora: '2026-07-22T10:30:00',
    vacunoId: 5,
    vacunoNombre: 'Luna',
    tipoPesoCode: 'CONTROL',
    pesoKg: 120,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriajeList],
      providers: [
        provideTranslateService({
          fallbackLang: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    })
      .overrideComponent(TriajeList, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(TriajeList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('triajes', [triaje]);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('totalItems', 1);
    fixture.detectChanges();
  });

  it('mapea triajes a datos de tabla conservando el registro original', () => {
    const [row] = component.tableData();

    expect(row.codigo).toBe('TRI-001');
    expect(row.vacunoNombre).toBe('Luna');
    expect(row.tipoPesoCode).toBe('CONTROL');
    expect(row.pesoKg).toBe(120);
    expect(row._raw).toBe(triaje);
  });

  it('emite nuevoTriaje al abrir formulario', () => {
    const spy = vi.fn();
    component.nuevoTriaje.subscribe(spy);

    component.openNewTriage();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('emite verTriaje con el registro original', () => {
    const spy = vi.fn();
    component.verTriaje.subscribe(spy);

    component.onVerTriaje({ _raw: triaje });

    expect(spy).toHaveBeenCalledWith(triaje);
  });
});
