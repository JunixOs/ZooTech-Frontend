import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastService } from '@core/notifications/toast.service';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { ReporteVacunoListadoFiltros, VacunoListadoItem } from '../../domain/models/reporte-vacuno.model';
import { ListadoVacunoContainerComponent } from './listado-vacuno-container.component';

const items = signal<VacunoListadoItem[]>([]);
const total = signal(0);
const loading = signal(false);
const downloading = signal(false);
const error = signal<string | null>(null);
const downloadError = signal<string | null>(null);

const facadeMock = {
  itemsSignal: items.asReadonly(),
  totalSignal: total.asReadonly(),
  loadingSignal: loading.asReadonly(),
  downloadingSignal: downloading.asReadonly(),
  errorSignal: error.asReadonly(),
  downloadErrorSignal: downloadError.asReadonly(),
  cargarListado: vi.fn<(filtros: ReporteVacunoListadoFiltros) => Promise<void>>(() =>
    Promise.resolve(),
  ),
  descargarListado: vi.fn<(formato: 'excel' | 'pdf', filtros: ReporteVacunoListadoFiltros) => Promise<Blob | null>>(
    () => Promise.resolve(new Blob(['ok'], { type: 'application/pdf' })),
  ),
};

const routerMock = {
  navigate: vi.fn(() => Promise.resolve(true)),
};

const toastMock = {
  success: vi.fn(),
};

const translateMock = {
  instant: vi.fn((key: string) =>
    key === 'vacunos.reportes.toast.downloadSuccess' ? 'Descarga exitosa' : key,
  ),
};

describe('ListadoVacunoContainerComponent', () => {
  let component: ListadoVacunoContainerComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    items.set([]);
    total.set(0);
    loading.set(false);
    downloading.set(false);
    error.set(null);
    downloadError.set(null);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) =>
                  ({ fechaDesde: '2026-05-18', fechaHasta: '2026-06-16', q: 'Luna' })[
                    key as 'fechaDesde' | 'fechaHasta' | 'q'
                  ] ?? null,
              },
            },
          },
        },
        { provide: Router, useValue: routerMock },
        { provide: ToastService, useValue: toastMock },
        { provide: TranslateService, useValue: translateMock },
        { provide: ReporteVacunoFacade, useValue: facadeMock },
      ],
    });

    component = TestBed.runInInjectionContext(() => new ListadoVacunoContainerComponent());
    component.ngOnInit();
  });

  it('el template contiene el titulo correcto del reporte listado', () => {
    const template = readFileSync(
      'src/app/modules/vacunos/reportes/presentation/listado-vacuno-container/listado-vacuno-container.component.html',
      'utf8',
    );

    expect(template).toContain('LISTADO VACUNO');
    expect(template).toContain('Vacunos/Reportes/Listado Vacuno');
  });

  it('define columnas coherentes con el contrato backend', () => {
    expect(component.columns.map((column) => column.key)).toEqual([
      'codigo',
      'nombre',
      'fechaNacimiento',
      'tipoAdquisicion',
      'raza',
      'color',
      'sexo',
      'granja',
      'estado',
      'fechaRegistro',
    ]);
  });

  it('construye filtros con los nombres del contrato backend', async () => {
    component.raza.set('JER');
    component.sexo.set('H');
    component.tipoAdquisicion.set('COMPRA');
    component.granja.set('7');
    component.estado.set('vivo');

    await component.onSearch('VAC-001');

    expect(facadeMock.cargarListado).toHaveBeenLastCalledWith({
      FechaInicio: '2026-05-18',
      FechaFin: '2026-06-16',
      Keyword: 'VAC-001',
      RazaCode: 'JER',
      SexoCode: 'H',
      TipoAdquisicionCode: 'COMPRA',
      GranjaId: '7',
      EstadoCode: 'vivo',
    });
  });

  it('descarga Excel con filtros activos, muestra confirmacion y vuelve a reportes', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:excel');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    component.raza.set('JER');
    await component.descargar('excel');

    expect(facadeMock.descargarListado).toHaveBeenCalledWith('excel', {
      FechaInicio: '2026-05-18',
      FechaFin: '2026-06-16',
      Keyword: 'Luna',
      RazaCode: 'JER',
      SexoCode: '',
      TipoAdquisicionCode: '',
      GranjaId: '',
      EstadoCode: '',
    });
    expect(toastMock.success).toHaveBeenCalledWith('Descarga exitosa');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/vacunos/reportes']);
  });

  it('descarga PDF con filtros activos', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:pdf');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    await component.descargar('pdf');

    expect(facadeMock.descargarListado).toHaveBeenCalledWith('pdf', expect.any(Object));
  });

  it('no navega ni muestra exito cuando falla la descarga', async () => {
    facadeMock.descargarListado.mockResolvedValueOnce(null);

    await component.descargar('pdf');

    expect(toastMock.success).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
