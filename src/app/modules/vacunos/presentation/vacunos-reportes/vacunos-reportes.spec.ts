import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastService } from '@core/notifications/toast.service';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { VacunosFacade } from '../../application/facades/vacunos.facade';
import { VacunosReportes } from './vacunos-reportes';

describe('VacunosReportes', () => {
  let component: VacunosReportes;
  let facade: {
    exportarArbolGenealogico: ReturnType<typeof vi.fn>;
    exportarActividad: ReturnType<typeof vi.fn>;
  };
  let toast: ToastService;
  let createObjectUrl: ReturnType<typeof vi.spyOn>;
  let revokeObjectUrl: ReturnType<typeof vi.spyOn>;
  let anchorClick: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    facade = {
      exportarArbolGenealogico: vi.fn(),
      exportarActividad: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [VacunosReportes],
      providers: [
        provideRouter([]),
        provideTranslateService({ defaultLanguage: 'es' }),
        { provide: VacunosFacade, useValue: facade },
        { provide: ReporteVacunoFacade, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    });

    component = TestBed.createComponent(VacunosReportes).componentInstance;
    toast = TestBed.inject(ToastService);
    createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report');
    revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    component.view.set('genealogy-tree');
    component.genealogyTree.set({
      id: 15,
      codigo: 'VAC-015',
      nombre: 'Luna',
      raza: 'HOLSTEIN',
      procedencia: 'UNAS',
      sexo: 'HEMBRA',
      nivel: 1,
      padre: null,
      madre: null,
    });
  });

  afterEach(() => {
    createObjectUrl.mockRestore();
    revokeObjectUrl.mockRestore();
    anchorClick.mockRestore();
  });

  it.each(['excel', 'pdf'] as const)(
    'delega la genealogia %s al backend y libera el ObjectURL',
    async (formato) => {
      facade.exportarArbolGenealogico.mockReturnValue(
        of(new Blob(['report'], { type: 'application/octet-stream' })),
      );

      await component.download(formato);

      expect(facade.exportarArbolGenealogico).toHaveBeenCalledWith(15, formato, 3);
      expect(createObjectUrl).toHaveBeenCalledOnce();
      expect(revokeObjectUrl).toHaveBeenCalledWith('blob:report');
      expect(component.exportingFormat()).toBeNull();
      expect(toast.toast().type).toBe('success');
    },
  );

  it('muestra el mensaje especifico y restaura el estado ante un 404', async () => {
    facade.exportarArbolGenealogico.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );

    await component.download('pdf');

    expect(component.exportingFormat()).toBeNull();
    expect(component.dataError()).toBe('El vacuno solicitado ya no se encuentra disponible.');
    expect(toast.toast()).toMatchObject({
      type: 'error',
      message: 'El vacuno solicitado ya no se encuentra disponible.',
    });
  });
});
