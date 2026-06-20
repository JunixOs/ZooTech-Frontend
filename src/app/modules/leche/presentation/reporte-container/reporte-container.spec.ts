import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';

import { ReporteContainer } from './reporte-container';

describe('ReporteContainer', () => {
  let component: ReporteContainer;
  let fixture: ComponentFixture<ReporteContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteContainer],
      providers: [
        {
          provide: LecheFacade,
          useValue: {
            registros: signal([]),
            loading: signal(false),
            cargarRegistros: async () => undefined,
          },
        },
        provideTranslateService({
          defaultLanguage: 'es',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
