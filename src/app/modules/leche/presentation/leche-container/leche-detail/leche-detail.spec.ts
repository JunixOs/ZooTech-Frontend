import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheDetail } from './leche-detail';

const mockLecheRepository = {
  getAll: () => of([]),
  getById: () => of({}),
  create: () => of(undefined),
  deleteById: () => of(undefined),
  updateById: () => of(undefined),
  getVacunos: () => of([]),
};

describe('LecheDetail', () => {
  let component: LecheDetail;
  let fixture: ComponentFixture<LecheDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecheDetail],
      providers: [
        { provide: LecheRepository, useValue: mockLecheRepository },
        provideTranslateService({ defaultLanguage: 'es' }),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LecheDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
