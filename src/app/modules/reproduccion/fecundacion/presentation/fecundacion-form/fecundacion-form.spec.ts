import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FecundacionFacade } from '../../application/facades/fecundacion.facade';
import {
  FecundacionEdit,
  FecundacionOptions,
  FecundacionVacunoOption,
} from '../../domain/models/fecundacion.model';
import { FecundacionForm } from './fecundacion-form';

const detalle: FecundacionEdit = {
  id: 6036,
  codigo: 'FEC-6036',
  tipoFecundacion: 'inseminacion_artificial',
  vacunoReceptor: { id: 10, codigo: 'VAC-010', nombre: 'Luna' },
  machoODonante: { id: 20, codigo: 'VAC-020', nombre: 'Toro' },
  machoExterno: false,
  fechaProcedimiento: '2026-07-20',
  responsable: 'Veterinario',
  resultado: 'pendiente_confirmacion',
  codigoSemen: 'SEM-01',
  codigoEmbrion: null,
  observaciones: 'Sin observaciones',
  estadoFecundacion: 'en_espera',
  creadoEn: '2026-07-20T00:00:00',
  actualizadoEn: '2026-07-21T00:00:00',
};

const opciones: FecundacionOptions = {
  tipos: [
    {
      code: 'inseminacion_artificial',
      nombre: 'Inseminación artificial',
    },
  ],
  resultados: [
    {
      code: 'pendiente_confirmacion',
      nombre: 'Pendiente de confirmación',
    },
  ],
  estados: [
    {
      code: 'en_espera',
      nombre: 'En Espera',
    },
    {
      code: 'gestante',
      nombre: 'Gestante',
    },
    {
      code: 'vacia',
      nombre: 'Vacía',
    },
  ],
};

const receptores: FecundacionVacunoOption[] = [
  { id: 11, codigo: 'VAC-011', nombre: 'Estrella', sexo: 'hembra' },
];
const donantes: FecundacionVacunoOption[] = [
  { id: 21, codigo: 'VAC-021', nombre: 'Tritón', sexo: 'macho' },
];

type FacadeStub = {
  obtenerOpciones: ReturnType<typeof vi.fn>;
  obtenerParaEditar: ReturnType<typeof vi.fn>;
  buscarVacunos: ReturnType<typeof vi.fn>;
  actualizar: ReturnType<typeof vi.fn>;
  crear: ReturnType<typeof vi.fn>;
};

describe('FecundacionForm', () => {
  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('coordina la carga, conserva los valores y excluye el código del PATCH', async () => {
    const opciones$ = new Subject<FecundacionOptions>();
    const detalle$ = new Subject<FecundacionEdit>();
    const receptores$ = new Subject<FecundacionVacunoOption[]>();
    const donantes$ = new Subject<FecundacionVacunoOption[]>();
    const facade = createFacade({
      obtenerOpciones: vi.fn(() => opciones$),
      obtenerParaEditar: vi.fn(() => detalle$),
      buscarVacunos: vi.fn((sexo: string) =>
        sexo === 'hembra' ? receptores$ : donantes$),
    });
    const fixture = await createFixture(facade);
    const component = fixture.componentInstance;

    opciones$.next(opciones);
    opciones$.complete();
    detalle$.next(detalle);
    detalle$.complete();
    receptores$.next(receptores);
    receptores$.complete();
    fixture.detectChanges();

    expect(component.cargando()).toBe(true);
    expect(component.codigoFecundacion()).toBe('');
    expect(
      (fixture.nativeElement.querySelector('fieldset.form-grid') as HTMLFieldSetElement)
        .disabled,
    ).toBe(true);

    donantes$.next(donantes);
    donantes$.complete();
    fixture.detectChanges();

    expect(component.cargando()).toBe(false);
    expect(
      (fixture.nativeElement.querySelector('fieldset.form-grid') as HTMLFieldSetElement)
        .disabled,
    ).toBe(false);
    expect(component.codigoFecundacion()).toBe('FEC-6036');
    expect(component.form.controls.vacunoReceptorId.value).toBe(10);
    expect(component.form.controls.vacunoDonanteId.value).toBe(20);
    expect(component.form.controls.estadoFecundacionCode.value).toBe('en_espera');
    expect(component.estados().map((estado) => estado.code)).toEqual([
      'en_espera',
      'gestante',
      'vacia',
    ]);
    expect(component.receptores().map((item) => item.id)).toContain(10);
    expect(component.donantes().map((item) => item.id)).toContain(20);

    const fields = fixture.nativeElement.querySelector('.form-grid').children;
    expect(fields[0].querySelector('.fecundacion-code')).not.toBeNull();
    expect(fields[1].querySelector('input[type="text"]')).not.toBeNull();
    expect(fields[2].querySelector('select[formControlName="tipoFecundacionCode"]'))
      .not.toBeNull();

    component.guardar();

    expect(facade.actualizar).toHaveBeenCalledOnce();
    const payload = facade.actualizar.mock.calls[0][1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('codigo');
    expect(payload['vacunoReceptorId']).toBe(10);
  });

  it('selecciona En Espera cuando el registro todavía no tiene historial', async () => {
    const facade = createFacade({
      obtenerParaEditar: vi.fn(() =>
        of({ ...detalle, estadoFecundacion: '' })),
    });
    const fixture = await createFixture(facade);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.form.controls.estadoFecundacionCode.value).toBe('en_espera');
  });

  it('bloquea todos los campos mientras guarda', async () => {
    const actualizar$ = new Subject<never>();
    const facade = createFacade({
      actualizar: vi.fn(() => actualizar$),
    });
    const fixture = await createFixture(facade);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.guardar();
    fixture.detectChanges();

    expect(component.guardando()).toBe(true);
    expect(
      (fixture.nativeElement.querySelector('fieldset.form-grid') as HTMLFieldSetElement)
        .disabled,
    ).toBe(true);
  });

  it('descarta resultados tardíos de búsquedas anteriores', async () => {
    vi.useFakeTimers();
    const primeraBusqueda = new Subject<FecundacionVacunoOption[]>();
    const segundaBusqueda = new Subject<FecundacionVacunoOption[]>();
    const facade = createFacade({
      buscarVacunos: vi.fn((sexo: string, query: string) => {
        if (sexo === 'hembra' && query === 'A') return primeraBusqueda;
        if (sexo === 'hembra' && query === 'AB') return segundaBusqueda;
        return of(sexo === 'hembra' ? receptores : donantes);
      }),
    });
    const fixture = await createFixture(facade);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.textoBusquedaReceptor = 'A';
    component.onBusquedaReceptorChange();
    await vi.advanceTimersByTimeAsync(251);
    component.textoBusquedaReceptor = 'AB';
    component.onBusquedaReceptorChange();
    await vi.advanceTimersByTimeAsync(251);

    segundaBusqueda.next([
      { id: 30, codigo: 'VAC-030', nombre: 'AB', sexo: 'hembra' },
    ]);
    primeraBusqueda.next([
      { id: 40, codigo: 'VAC-040', nombre: 'Resultado tardío', sexo: 'hembra' },
    ]);

    expect(component.receptores().map((item) => item.id)).toEqual([30]);
  });
});

function createFacade(overrides: Partial<FacadeStub> = {}): FacadeStub {
  return {
    obtenerOpciones: vi.fn(() => of(opciones)),
    obtenerParaEditar: vi.fn(() => of(detalle)),
    buscarVacunos: vi.fn((sexo: string) =>
      of(sexo === 'hembra' ? receptores : donantes)),
    actualizar: vi.fn(() =>
      of({
        id: detalle.id,
        tipoFecundacion: detalle.tipoFecundacion,
        vacunoReceptor: detalle.vacunoReceptor,
        machoODonante: detalle.machoODonante,
        fechaProcedimiento: detalle.fechaProcedimiento,
        responsable: detalle.responsable,
        resultado: detalle.resultado,
        actualizadoEn: detalle.actualizadoEn,
      })),
    crear: vi.fn(),
    ...overrides,
  };
}

async function createFixture(facade: FacadeStub) {
  await TestBed.configureTestingModule({
    imports: [FecundacionForm],
    providers: [
      provideRouter([]),
      provideTranslateService(),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: {
              get: (name: string) => name === 'id' ? '6036' : null,
            },
          },
        },
      },
      { provide: FecundacionFacade, useValue: facade },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(FecundacionForm);
  fixture.detectChanges();
  return fixture;
}
