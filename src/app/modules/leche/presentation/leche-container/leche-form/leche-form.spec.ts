import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';
import { LecheForm } from './leche-form';

describe('LecheForm', () => {
  let component: LecheForm;
  let fixture: ComponentFixture<LecheForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecheForm],
      providers: [
        {
          provide: LecheFacade,
          useValue: {
            vacunos: signal([]),
            cargarVacunos: async () => undefined,
            registrarRegistro: async () => undefined,
          },
        },
        provideTranslateService({
          defaultLanguage: 'es',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LecheForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
