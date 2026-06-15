import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Vacuno } from '../../domain/models/vacuno.model';
import { VacunosApiService } from '../../infrastructure/vacunos.api.service';
import { VacunoDetail } from './vacuno-detail';

const translations = {
  vacunos: {
    form: { loading: 'Cargando datos del vacuno...' },
    listado: { breadcrumb: 'Vacunos' },
    detail: {
      errors: {
        codigoInvalido: 'Codigo de vacuno no valido',
        noEncontrado: 'Vacuno no encontrado',
        errorEliminar: 'No se pudo eliminar el vacuno. Intente nuevamente.',
        razonRequerida: 'Ingrese una razon de eliminacion.',
        errorEliminar400: 'Solicitud invalida: revise que el motivo de eliminacion sea valido.',
        errorEliminar404: 'El vacuno no fue encontrado o ya no esta disponible.',
        errorEliminar409: 'No se puede eliminar el vacuno porque tiene informacion relacionada o registros dependientes.',
        errorEliminar500: 'Error interno del servidor. Intente nuevamente mas tarde.',
      },
    },
  },
};

class FakeLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, unknown>> {
    return of(translations);
  }
}

const vacunoMock: Vacuno = {
  id: 1,
  codigo: 'VAC-001',
  nombre: 'Luna',
  fechaNacimiento: '2024-01-15',
  adquisicionPor: 'compra',
  raza: 'Jersey',
  color: 'Marron',
  sexo: 'hembra',
  codigoPadre: 'VAC-P01',
  codigoMadre: 'VAC-M01',
  granja: 'Principal',
  distrito: 'Lima',
  departamento: 'Lima',
  provincia: 'Lima',
  aptoPara: 'produccion_leche',
  fechaRegistroFuncion: '2024-02-01',
  observaciones: 'Sin observaciones',
  estado: 'activo',
};

describe('VacunoDetail - flujo de eliminacion', () => {
  let component: VacunoDetail;
  let api: {
    obtenerVacuno: ReturnType<typeof vi.fn>;
    eliminarVacuno: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    api = {
      obtenerVacuno: vi.fn(() => of(vacunoMock)),
      eliminarVacuno: vi.fn(() => of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslateService({
          defaultLanguage: 'es',
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'codigo' ? vacunoMock.codigo : null),
              },
            },
          },
        },
        { provide: VacunosApiService, useValue: api },
      ],
    });

    router = TestBed.inject(Router);
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('es', translations);
    translate.use('es');
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component = TestBed.runInInjectionContext(() => new VacunoDetail());
    component.ngOnInit();
  });

  it('abre el modal de eliminacion desde VacunoDetail', () => {
    component.openDeleteModal();

    expect(component.isDeleteModalOpen()).toBe(true);
    expect(component.deleteReason()).toBe('');
    expect(component.deleteError()).toBe('');
  });

  it('cancela eliminacion, no llama API y navega al listado con mensaje de cancelacion', () => {
    component.openDeleteModal();

    component.closeDeleteModal();

    expect(component.isDeleteModalOpen()).toBe(false);
    expect(api.eliminarVacuno).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/vacunos/listado'], {
      queryParams: { cancelled: 'VAC-001' },
    });
  });

  it('valida motivo vacio y no llama API', () => {
    component.openDeleteModal();
    component.deleteReason.set('   ');

    component.confirmDelete();

    expect(api.eliminarVacuno).not.toHaveBeenCalled();
    expect(component.deleteError()).toBe('Ingrese una razon de eliminacion.');
  });

  it('confirma eliminacion exitosa, llama API y navega al listado con mensaje de exito', () => {
    component.openDeleteModal();
    component.deleteReason.set('Duplicado operativo');

    component.confirmDelete();

    expect(api.eliminarVacuno).toHaveBeenCalledWith('VAC-001', 'Duplicado operativo');
    expect(router.navigate).toHaveBeenCalledWith(['/vacunos/listado'], {
      queryParams: { deleted: 'VAC-001' },
    });
  });

  it('deshabilita controles y evita cerrar mientras deleteSubmitting esta activo', () => {
    const pendingDelete = new Subject<void>();
    api.eliminarVacuno.mockReturnValue(pendingDelete.asObservable());
    component.openDeleteModal();
    component.deleteReason.set('Duplicado operativo');

    component.confirmDelete();

    expect(component.deleteSubmitting()).toBe(true);

    component.closeDeleteModal();

    expect(component.isDeleteModalOpen()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it.each([
    [400, 'Solicitud invalida: revise que el motivo de eliminacion sea valido.'],
    [404, 'El vacuno no fue encontrado o ya no esta disponible.'],
    [409, 'No se puede eliminar el vacuno porque tiene informacion relacionada o registros dependientes.'],
    [500, 'Error interno del servidor. Intente nuevamente mas tarde.'],
  ])('muestra mensaje adecuado para error %s', (status, expectedMessage) => {
    api.eliminarVacuno.mockReturnValue(
      throwError(() => Object.assign(new Error('Backend error'), { status })),
    );
    component.openDeleteModal();
    component.deleteReason.set('Duplicado operativo');

    component.confirmDelete();

    expect(component.deleteSubmitting()).toBe(false);
    expect(component.deleteError()).toBe(expectedMessage);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
