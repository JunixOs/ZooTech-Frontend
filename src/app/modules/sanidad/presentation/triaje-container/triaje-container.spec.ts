import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from '@core/notifications/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { Triaje, TriajeHistorialItem } from '@modules/sanidad/domain/models/triaje.model';
import { TriajeContainer } from './triaje-container';

describe('TriajeContainer', () => {
  let component: TriajeContainer;
  let fixture: ComponentFixture<TriajeContainer>;
  let facade: any;
  let toast: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const triaje: Triaje = {
    id: 1,
    codigo: 'TRI-001',
    fechaHora: '2026-07-22T10:30:00',
    vacunoId: 5,
    vacunoNombre: 'Luna',
    tipoPesoCode: 'CONTROL',
    pesoKg: 120,
  };

  const historial: TriajeHistorialItem[] = [
    { id: 1, fechaHora: '2026-07-22T10:30:00', pesoKg: 120, tipoPesoCode: 'CONTROL' },
  ];

  beforeEach(async () => {
    facade = {
      tiposPeso: vi.fn(() => []),
      vacunos: vi.fn(() => []),
      triajes: vi.fn(() => [triaje]),
      loading: vi.fn(() => false),
      paginaActual: vi.fn(() => 1),
      limitePorPagina: vi.fn(() => 10),
      totalItems: vi.fn(() => 1),
      actualizarFiltros: vi.fn(),
      cargarCatalogos: vi.fn(),
      cargarPagina: vi.fn(),
      cambiarLimite: vi.fn(),
      actualizarBusqueda: vi.fn(),
      getHistorialByVacunoId: vi.fn(() => of(historial)),
      getById: vi.fn(() => of(triaje)),
      create: vi.fn(() => of(triaje)),
      update: vi.fn(() => of(void 0)),
      delete: vi.fn(() => of(void 0)),
    };
    toast = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TriajeContainer],
      providers: [
        { provide: TriajeFacade, useValue: facade },
        { provide: ToastService, useValue: toast },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: ConfirmDialogService, useValue: {} },
      ],
    })
      .overrideComponent(TriajeContainer, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(TriajeContainer);
    component = fixture.componentInstance;
  });

  it('inicializa filtros, catalogos y primera pagina', () => {
    component.ngOnInit();

    expect(facade.actualizarFiltros).toHaveBeenCalledWith({});
    expect(facade.cargarCatalogos).toHaveBeenCalledOnce();
    expect(facade.cargarPagina).toHaveBeenCalledWith(1);
  });

  it('abre detalle y carga historial del vacuno', () => {
    component.openViewTriage(triaje);

    expect(facade.getById).toHaveBeenCalledWith(1);
    expect(facade.getHistorialByVacunoId).toHaveBeenCalledWith(5);
    expect(component.selectedTriaje()).toEqual(triaje);
    expect(component.historial()).toEqual(historial);
    expect(component.showViewTriage()).toBe(true);
  });

  it('muestra error cuando falla la carga del detalle', () => {
    facade.getById.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.openViewTriage(triaje);

    expect(toast.error).toHaveBeenCalledWith('sanidad.triaje.mensajes.cargaError');
  });

  it('crea triaje, recarga pagina y cierra modal', () => {
    component.showNewTriage.set(true);

    component.onTriajeSaved({
      fechaHora: '2026-07-22T10:30',
      vacunoId: 5,
      tipoPesoCode: 'CONTROL',
      pesoKg: 120,
      observaciones: null,
      estadoRegistroCode: 'ACTIVO',
      encargadoUsuarioId: null,
    });

    expect(facade.create).toHaveBeenCalledOnce();
    expect(facade.cargarPagina).toHaveBeenCalledWith(1);
    expect(toast.success).toHaveBeenCalledWith('sanidad.triaje.mensajes.registroExito');
    expect(component.showNewTriage()).toBe(false);
  });

  it('no elimina si el motivo tiene menos de 5 caracteres', () => {
    component.triajeToDelete.set(triaje);
    component.deleteReason.set('abc');

    component.confirmDelete();

    expect(facade.delete).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('sanidad.triaje.mensajes.motivoEliminarMinimo');
  });

  it('elimina con motivo valido, recarga y cierra modales', () => {
    component.showDeleteModal.set(true);
    component.showViewTriage.set(true);
    component.triajeToDelete.set(triaje);
    component.deleteReason.set('Registro duplicado');

    component.confirmDelete();

    expect(facade.delete).toHaveBeenCalledWith(1, { motivoEliminacion: 'Registro duplicado' });
    expect(facade.cargarPagina).toHaveBeenCalledWith(1);
    expect(component.showDeleteModal()).toBe(false);
    expect(component.showViewTriage()).toBe(false);
    expect(toast.success).toHaveBeenCalledWith('sanidad.triaje.mensajes.eliminadoExito');
  });

  it('convierte rango de fechas a filtros ISO', () => {
    component.onDateRangeChange({
      start: new Date(Date.UTC(2026, 6, 1)),
      end: new Date(Date.UTC(2026, 6, 31)),
    });

    expect(facade.actualizarFiltros).toHaveBeenCalledWith({
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-31',
    });
  });
});
