import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Vacuno } from '@modules/vacunos/domain/models/vacuno.model';
import { VacunosApiService } from '@modules/vacunos/infrastructure/vacunos-api.service';
import { VacunosContainerComponent } from './vacunos-container.component';

const VALID_VACUNO: Vacuno = {
  codigo: 'VAC_110',
  nombre: 'Chispa',
  fechaNacimiento: '2026-05-01',
  adquisicionPor: 'monta',
  precioCompra: null,
  raza: 'Angus',
  color: 'Negro',
  sexo: 'hembra',
  codigoPadre: 'PADRE001',
  codigoMadre: 'MADRE001',
  granja: 'Central',
  distrito: 'Tulumayo',
  departamento: 'Huanuco',
  provincia: 'Leoncio Prado',
  aptoPara: 'produccion_leche',
  fechaRegistroFuncion: '2026-05-31',
  observaciones: '',
  fotoUrl: null,
  estado: 'vivo',
};

describe('VacunosContainerComponent', () => {
  let component: VacunosContainerComponent;
  let fixture: ComponentFixture<VacunosContainerComponent>;
  let vacunosApi: {
    search: ReturnType<typeof vi.fn>;
    getOptions: ReturnType<typeof vi.fn>;
    getByCodigo: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let router: { url: string; navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vacunosApi = {
      search: vi.fn().mockReturnValue(of({
        items: [VALID_VACUNO],
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      })),
      getOptions: vi.fn().mockReturnValue(of({
        adquisicionOptions: ['monta', 'compra'],
        razaOptions: ['Angus', 'Holstein'],
        sexoOptions: ['hembra', 'macho'],
        aptoParaOptions: ['produccion_leche', 'carne'],
      })),
      getByCodigo: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    router = { url: '/vacunos', navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VacunosContainerComponent],
      providers: [
        {
          provide: VacunosApiService,
          useValue: vacunosApi,
        },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { root: {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VacunosContainerComponent);
    component = fixture.componentInstance;
  });

  it('debe convertir los codigos a mayusculas mientras se escriben', () => {
    component['draftVacuno'].set({ ...VALID_VACUNO, codigo: '' });

    component.setDraftValue('codigo', 'vac_110');
    component.setDraftValue('codigoPadre', 'padre001');
    component.setDraftValue('codigoMadre', 'madre001');

    expect(component.detailVacuno()?.codigo).toBe('VAC_110');
    expect(component.detailVacuno()?.codigoPadre).toBe('PADRE001');
    expect(component.detailVacuno()?.codigoMadre).toBe('MADRE001');
  });

  it('debe rechazar precio compra vacio cuando la adquisicion es compra', () => {
    const message = component['validateDraft']({
      ...VALID_VACUNO,
      adquisicionPor: 'compra',
      precioCompra: null,
    });

    expect(message).toContain('precio de compra');
  });

  it('debe rechazar observaciones mayores a 30 palabras o 150 caracteres', () => {
    const message = component['validateDraft']({
      ...VALID_VACUNO,
      observaciones: Array.from({ length: 31 }, (_, index) => `palabra${index}`).join(' '),
    });

    expect(message).toContain('30 palabras');
  });

  it('debe rechazar codigos duplicados antes de enviar el registro', () => {
    component.isCreating.set(true);
    component['tableData'].set([VALID_VACUNO]);

    const message = component['validateDraft']({ ...VALID_VACUNO });

    expect(message).toContain('Ya existe');
  });

  it('debe aceptar imagenes PNG y JPG y rechazar otros formatos', () => {
    const input = document.createElement('input');
    const invalidFile = new File(['demo'], 'demo.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { value: [invalidFile] });

    component.onPhotoSelected({ target: input } as unknown as Event);

    expect(component.errorMessage()).toContain('JPG');
  });

  it('debe bloquear letras de notacion numerica en el precio', () => {
    const preventDefault = vi.fn();

    component.blockInvalidNumberInput({ key: 'e', preventDefault } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it('debe filtrar el listado por codigo y estado desde la fila de filtros', () => {
    component['tableData'].set([
      VALID_VACUNO,
      { ...VALID_VACUNO, codigo: 'VAC_220', nombre: 'Luna', estado: 'muerto' },
    ]);

    component.setColumnFilter('codigo', '220');
    expect(component.vacunos()).toHaveLength(1);
    expect(component.vacunos()[0].codigo).toBe('VAC_220');

    component.setColumnFilter('codigo', '');
    component.toggleEstadoFilter('vivo');
    expect(component.vacunos()).toHaveLength(1);
    expect(component.vacunos()[0].estado).toBe('vivo');
  });

  it('debe actualizar un vacuno editado y mostrar mensaje de exito', () => {
    const actualizado = { ...VALID_VACUNO, nombre: 'Luna' };
    vacunosApi.update.mockReturnValue(of(actualizado));
    component['selectedVacunoData'].set(VALID_VACUNO);
    component['draftVacuno'].set(actualizado);
    component.isEditing.set(true);

    component.onEdit();

    expect(vacunosApi.update).toHaveBeenCalledWith(
      'VAC_110',
      expect.objectContaining({
        vacuno: expect.objectContaining({ nombre: 'Luna' }),
      }),
    );
    expect(component.successMessage()).toBe('Se actualizó correctamente !');
    expect(router.navigate).toHaveBeenCalledWith(['/vacunos']);
  });

  it('debe evitar el envio cuando falta un campo obligatorio en edicion', () => {
    component['selectedVacunoData'].set(VALID_VACUNO);
    component['draftVacuno'].set({ ...VALID_VACUNO, nombre: '' });
    component.isEditing.set(true);

    component.onEdit();

    expect(vacunosApi.update).not.toHaveBeenCalled();
    expect(component.errorMessage()).toContain('nombre');
  });

  it('debe mostrar error de duplicidad devuelto por backend al editar', () => {
    vacunosApi.update.mockReturnValue(throwError(() => ({
      error: { message: 'Ya existe otro vacuno con los mismos datos principales.' },
    })));
    component['selectedVacunoData'].set(VALID_VACUNO);
    component['draftVacuno'].set({ ...VALID_VACUNO, nombre: 'Luna' });
    component.isEditing.set(true);

    component.onEdit();

    expect(component.errorMessage()).toContain('Ya existe otro vacuno');
  });

  it('debe cancelar la edicion sin persistir cambios', () => {
    component['selectedVacunoData'].set(VALID_VACUNO);
    component['draftVacuno'].set({ ...VALID_VACUNO, nombre: 'Luna' });
    component.isEditing.set(true);

    component.onCancelDetail();

    expect(vacunosApi.update).not.toHaveBeenCalled();
    expect(component.detailVacuno()).toBeNull();
    expect(component.isEditing()).toBe(false);
  });
});
