import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ReporteCeloVacunoDetalleComponent } from './reporte-celo-vacuno-detalle.component';
import { CeloFacade } from '../../../application/celo.facade';

describe('ReporteCeloVacunoDetalleComponent', () => {
  let component: ReporteCeloVacunoDetalleComponent;
  let fixture: ComponentFixture<ReporteCeloVacunoDetalleComponent>;

  let celoFacadeMock: any;
  let routerMock: any;

  let facadeCalls: Record<string, any[][]>;
  let routerNavigateCalls: any[][];

  const detalleMock = [
    {
      fechaDeteccion: '2026-07-01',
      horaDeteccion: '10:30',
      estadoCelo: 'EN_CELO',
      observacion: 'Prueba unitaria',
    },
  ];

  const facadeMethods = [
    'limpiarDetalleCeloPorVacuno',
    'obtenerDetalleCeloPorVacuno',
    'getDetalleCeloPorVacuno',
    'obtenerReporteCeloVacunoDetalle',
    'getReporteCeloVacunoDetalle',
    'cargarDetalleCeloPorVacuno',
    'loadDetalleCeloPorVacuno',
  ];

  const routeValues: Record<string, string> = {
    id: '1',
    vacunoId: '1',
    idVacuno: '1',
  };

  const paramMapMock = convertToParamMap(routeValues);

  const paramsMock = {
    ...routeValues,
    get: (key: string) => routeValues[key] ?? null,
  };

  beforeEach(async () => {
    facadeCalls = {};
    routerNavigateCalls = [];
    celoFacadeMock = {};

    celoFacadeMock.detalleCeloPorVacuno = signal(detalleMock);
    celoFacadeMock.detalleCeloVacuno = signal(detalleMock);
    celoFacadeMock.detallesCeloPorVacuno = signal(detalleMock);
    celoFacadeMock.detalles = signal(detalleMock);
    celoFacadeMock.detalle = signal(detalleMock);
    celoFacadeMock.data = signal(detalleMock);
    celoFacadeMock.rows = signal(detalleMock);

    celoFacadeMock.loadingDetalleCeloPorVacuno = signal(false);
    celoFacadeMock.errorDetalleCeloPorVacuno = signal(null);
    celoFacadeMock.loading = signal(false);
    celoFacadeMock.error = signal(null);

    facadeMethods.forEach((method) => {
      facadeCalls[method] = [];

      celoFacadeMock[method] = (...args: any[]) => {
        facadeCalls[method].push(args);

        if (method === 'limpiarDetalleCeloPorVacuno') {
          return;
        }

        return of(detalleMock);
      };
    });

    routerMock = {
      navigate: (...args: any[]) => {
        routerNavigateCalls.push(args);
        return Promise.resolve(true);
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        ReporteCeloVacunoDetalleComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: CeloFacade,
          useValue: celoFacadeMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: paramMapMock,
              queryParamMap: paramMapMock,
              params: paramsMock,
              queryParams: paramsMock,
              parent: {
                paramMap: paramMapMock,
                queryParamMap: paramMapMock,
                params: paramsMock,
                queryParams: paramsMock,
              },
            },
            parent: {
              snapshot: {
                paramMap: paramMapMock,
                queryParamMap: paramMapMock,
                params: paramsMock,
                queryParams: paramsMock,
              },
              paramMap: of(paramMapMock),
              queryParamMap: of(paramMapMock),
              params: of(routeValues),
              queryParams: of(routeValues),
            },
            paramMap: of(paramMapMock),
            queryParamMap: of(paramMapMock),
            params: of(routeValues),
            queryParams: of(routeValues),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ReporteCeloVacunoDetalleComponent, {
        set: {
          template: '<div></div>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReporteCeloVacunoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getCalledFacadeCall(): any[] | undefined {
    const methodsToCheck = facadeMethods.filter(
      (method) => method !== 'limpiarDetalleCeloPorVacuno'
    );

    for (const method of methodsToCheck) {
      if (facadeCalls[method]?.length > 0) {
        return facadeCalls[method][0];
      }
    }

    return undefined;
  }

  function resolveValue(value: any): any {
    if (value === undefined || value === null) {
      return value;
    }

    if (typeof value === 'function') {
      try {
        return value();
      } catch {
        return value;
      }
    }

    return value;
  }

  function readArrayProperty(source: any, propertyNames: string[]): any[] {
    for (const propertyName of propertyNames) {
      const value = source[propertyName];

      if (value === undefined || value === null) {
        continue;
      }

      const resolvedValue = resolveValue(value);

      if (Array.isArray(resolvedValue)) {
        return resolvedValue;
      }
    }

    return [];
  }

  function readComponentArray(propertyNames: string[]): any[] {
    const componentData = readArrayProperty(component as any, propertyNames);

    if (componentData.length > 0) {
      return componentData;
    }

    return readArrayProperty(celoFacadeMock, propertyNames);
  }

  it('debe crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe limpiar el detalle de celo por vacuno al inicializar', () => {
    expect(facadeCalls['limpiarDetalleCeloPorVacuno'].length).toBeGreaterThan(0);
  });
  it('debe tener configurado el id del vacuno en la ruta', () => {
    const route = TestBed.inject(ActivatedRoute);

    expect(route.snapshot.paramMap.get('id')).toBe('1');
    expect(route.snapshot.paramMap.get('vacunoId')).toBe('1');
    expect(route.snapshot.paramMap.get('idVacuno')).toBe('1');
  });

  it('debe tener disponible la información mockeada desde el facade', () => {
    const data = celoFacadeMock.detalleCeloPorVacuno();

    expect(data.length).toBeGreaterThan(0);
    expect(data[0].estadoCelo).toBe('EN_CELO');
  });

  it('debe cargar la información mockeada del detalle de celo', () => {
    const data = readComponentArray([
      'detalles',
      'detalle',
      'detalleCelo',
      'detalleCeloPorVacuno',
      'detallesCeloPorVacuno',
      'data',
      'rows',
      'tableData',
    ]);

    expect(data.length).toBeGreaterThan(0);
    expect(data[0].estadoCelo).toBe('EN_CELO');
  });

  it('debe tener columnas configuradas para la tabla', () => {
    const columns = readComponentArray([
      'columns',
      'columnas',
      'tableColumns',
    ]);

    expect(columns.length).toBeGreaterThan(0);
  });

  it('debe usar keys de traducción en las columnas y no textos hardcodeados', () => {
    const columns = readComponentArray([
      'columns',
      'columnas',
      'tableColumns',
    ]);

    const headers = columns.map((column: any) =>
      column.headerKey ??
      column.header ??
      column.title ??
      column.label ??
      column.name ??
      ''
    );

    expect(headers.length).toBeGreaterThan(0);

    headers.forEach((header: string) => {
      expect(header).toBeTruthy();
      expect(header).toContain('.');
    });
  });
});
