import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { LecheForm } from './leche-form';

describe('LecheForm', () => {
  let component: LecheForm;
  let fixture: ComponentFixture<LecheForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecheForm],
      providers: [
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
