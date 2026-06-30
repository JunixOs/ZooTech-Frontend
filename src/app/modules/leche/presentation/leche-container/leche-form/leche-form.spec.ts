import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheForm } from './leche-form';

const mockLecheRepository = {
  getAll: () => of([]),
  getById: () => of({}),
  create: () => of(undefined),
  deleteById: () => of(undefined),
  updateById: () => of(undefined),
  getVacunos: () => of([]),
};

describe('LecheForm', () => {
  let component: LecheForm;
  let fixture: ComponentFixture<LecheForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecheForm],
      providers: [
        { provide: LecheRepository, useValue: mockLecheRepository },
        provideTranslateService({ defaultLanguage: 'es' }),
        provideRouter([]),
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
