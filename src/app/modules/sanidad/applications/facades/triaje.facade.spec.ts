import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TriajeRepository } from '@modules/sanidad/domain/interfaces/triaje-repository.interface';
import {
  ActualizarTriajePayload,
  EliminarTriajePayload,
  RegistrarTriajePayload,
  TriajeHistorialItem,
  TriajeRegistro,
} from '@modules/sanidad/domain/models/triaje.model';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { PaginatedResult } from '@shared/models/pagination.model';
import { TriajeFacade } from './triaje.facade';

describe('TriajeFacade', () => {
  let facade: TriajeFacade;
  let repository: {
    getAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    getTiposPeso: ReturnType<typeof vi.fn>;
    getVacunos: ReturnType<typeof vi.fn>;
    getHistorialByVacunoId: ReturnType<typeof vi.fn>;
    downloadExcel: ReturnType<typeof vi.fn>;
    downloadPdf: ReturnType<typeof vi.fn>;
  };
  let router: { url: string };
  let filtroService: {
    fechaDesde: ReturnType<typeof signal<string>>;
    fechaHasta: ReturnType<typeof signal<string>>;
    nombre: ReturnType<typeof signal<string>>;
  };

  const triaje: TriajeRegistro = {
    id: 1,
    codigo: 'TRI-001',
    fechaHora: '2026-07-22T10:30:00',
    vacunoId: 5,
    vacunoNombre: 'Luna',
    tipoPesoCode: 'CONTROL',
    pesoKg: 120,
  };

  const pageResult: PaginatedResult<TriajeRegistro> = {
    items: [triaje],
    totalItems: 1,
    totalPaginas: 1,
    paginaActual: 1,
    limitePorPagina: 10,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    repository = {
      getAll: vi.fn(() => of(pageResult)),
      getById: vi.fn(() => of(triaje)),
      create: vi.fn((payload: RegistrarTriajePayload) => of({ ...triaje, ...payload })),
      update: vi.fn((_id: number, _payload: ActualizarTriajePayload) => of(void 0)),
      delete: vi.fn((_id: number, _payload: EliminarTriajePayload) => of(void 0)),
      getTiposPeso: vi.fn(() => of([{ code: 'CONTROL', nombre: 'Control' }])),
      getVacunos: vi.fn(() => of([{ id: 5, codigo: 'VAC-005', nombre: 'Luna' }])),
      getHistorialByVacunoId: vi.fn((_id: number): Observable<TriajeHistorialItem[]> => of([])),
      downloadExcel: vi.fn(() => of(new Blob(['excel']))),
      downloadPdf: vi.fn(() => of(new Blob(['pdf']))),
    };
    router = { url: '/sanidad/triaje' };
    filtroService = {
      fechaDesde: signal('2026-07-01'),
      fechaHasta: signal('2026-07-31'),
      nombre: signal(''),
    };

    TestBed.configureTestingModule({
      providers: [
        TriajeFacade,
        { provide: TriajeRepository, useValue: repository },
        { provide: Router, useValue: router },
        { provide: ReporteFiltroService, useValue: filtroService },
      ],
    });
    facade = TestBed.inject(TriajeFacade);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('carga catalogos y actualiza signals', () => {
    facade.cargarCatalogos();

    expect(facade.tiposPeso()).toEqual([{ code: 'CONTROL', nombre: 'Control' }]);
    expect(facade.vacunos()).toEqual([{ id: 5, codigo: 'VAC-005', nombre: 'Luna' }]);
  });

  it('carga pagina y actualiza paginacion', () => {
    facade.cargarPagina(1);

    expect(repository.getAll).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      uniqueVacuno: undefined,
      fecha: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined,
      vacunoId: undefined,
      codigo: undefined,
      vacunoNombre: undefined,
      tipoPeso: undefined,
      pesoKg: undefined,
    });
    expect(facade.triajes()).toEqual([triaje]);
    expect(facade.totalItems()).toBe(1);
    expect(facade.loading()).toBe(false);
  });

  it('normaliza filtros y dispara busqueda con debounce', () => {
    facade.actualizarFiltros({
      fechaHora: '3/7/2026',
      codigo: ' TRI ',
      tipoPesoCode: ' CONTROL ',
      pesoKg: ' 12,5 ',
    });

    expect(repository.getAll).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(repository.getAll).toHaveBeenCalledWith(expect.objectContaining({
      fecha: '2026-07-03',
      codigo: 'TRI',
      tipoPeso: 'CONTROL',
      pesoKg: '12.5',
    }));
  });

  it('descarta filtro peso invalido antes de consultar', () => {
    facade.actualizarFiltros({ pesoKg: '12a' });

    vi.advanceTimersByTime(300);

    expect(repository.getAll).toHaveBeenCalledWith(expect.objectContaining({ pesoKg: undefined }));
  });

  it('usa fechas por defecto del servicio de filtros en reportes', () => {
    router.url = '/sanidad/reportes/listadoGeneral';

    facade.cargarPagina(1);

    expect(repository.getAll).toHaveBeenCalledWith(expect.objectContaining({
      fechaDesde: '2026-07-01',
      fechaHasta: '2026-07-31',
    }));
  });

  it('ignora respuestas obsoletas de cargas anteriores', () => {
    const first = new Subject<PaginatedResult<TriajeRegistro>>();
    const second = new Subject<PaginatedResult<TriajeRegistro>>();
    repository.getAll
      .mockReturnValueOnce(first.asObservable())
      .mockReturnValueOnce(second.asObservable());

    facade.cargarPagina(1);
    facade.cargarPagina(2);

    second.next({
      items: [{ ...triaje, id: 2, codigo: 'TRI-002' }],
      totalItems: 2,
      totalPaginas: 1,
      paginaActual: 2,
      limitePorPagina: 10,
    });
    first.next(pageResult);

    expect(facade.triajes()[0].codigo).toBe('TRI-002');
    expect(facade.paginaActual()).toBe(2);
  });

  it('cambia limite y recarga la primera pagina', () => {
    repository.getAll.mockReturnValueOnce(of({ ...pageResult, limitePorPagina: 25 }));

    facade.cambiarLimite(25);

    expect(facade.limitePorPagina()).toBe(25);
    expect(repository.getAll).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 25 }));
  });

  it('descarga excel o pdf usando filtros construidos', () => {
    facade.actualizarFiltros({ codigo: ' TRI-001 ', pesoKg: '120' });

    facade.descargar('excel').subscribe();
    facade.descargar('pdf').subscribe();

    expect(repository.downloadExcel).toHaveBeenCalledWith(expect.objectContaining({
      codigo: 'TRI-001',
      pesoKg: '120',
    }));
    expect(repository.downloadPdf).toHaveBeenCalledWith(expect.objectContaining({
      codigo: 'TRI-001',
      pesoKg: '120',
    }));
  });

  it('setea error y apaga loading cuando falla cargarPagina', () => {
    repository.getAll.mockReturnValueOnce(new Observable((subscriber) => subscriber.error(new Error('boom'))));

    facade.cargarPagina(1);

    expect(facade.error()).toBe('Error al cargar los triajes');
    expect(facade.loading()).toBe(false);
  });

  it('actualizarBusqueda usa el texto como filtro de codigo', () => {
    facade.actualizarBusqueda(' TRI-001 ');

    expect(repository.getAll).toHaveBeenCalledWith(expect.objectContaining({ codigo: 'TRI-001' }));
  });

  it('cargarPorVacuno setea vacunoId y recarga la primera pagina', () => {
    facade.cargarPorVacuno(5);

    expect(facade.filtros()).toEqual({ vacunoId: '5' });
    expect(repository.getAll).toHaveBeenCalledWith(expect.objectContaining({ page: 1, vacunoId: '5' }));
  });

  it('delega operaciones directas al repositorio', () => {
    const createPayload: RegistrarTriajePayload = {
      fechaHora: '2026-07-22T10:30',
      vacunoId: 5,
      tipoPesoCode: 'CONTROL',
      pesoKg: 120,
      observaciones: null,
      estadoRegistroCode: 'ACTIVO',
      encargadoUsuarioId: null,
    };
    const updatePayload: ActualizarTriajePayload = {
      tipoPesoCode: 'CONTROL',
      pesoKg: 121,
      observaciones: null,
    };
    const deletePayload: EliminarTriajePayload = { motivoEliminacion: 'Registro duplicado' };

    facade.getById(1).subscribe();
    facade.create(createPayload).subscribe();
    facade.update(1, updatePayload).subscribe();
    facade.delete(1, deletePayload).subscribe();
    facade.getHistorialByVacunoId(5).subscribe();

    expect(repository.getById).toHaveBeenCalledWith(1);
    expect(repository.create).toHaveBeenCalledWith(createPayload);
    expect(repository.update).toHaveBeenCalledWith(1, updatePayload);
    expect(repository.delete).toHaveBeenCalledWith(1, deletePayload);
    expect(repository.getHistorialByVacunoId).toHaveBeenCalledWith(5);
  });

  it('no recarga si los filtros normalizados no cambian', () => {
    facade.actualizarFiltros({ codigo: 'TRI-001' });
    vi.advanceTimersByTime(300);
    repository.getAll.mockClear();

    facade.actualizarFiltros({ codigo: ' TRI-001 ' });
    vi.advanceTimersByTime(300);

    expect(repository.getAll).not.toHaveBeenCalled();
  });
});
