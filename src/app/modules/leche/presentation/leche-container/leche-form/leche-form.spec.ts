import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecheForm } from './leche-form';

describe('LecheForm', () => {
  let component: LecheForm;
  let fixture: ComponentFixture<LecheForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecheForm],
    }).compileComponents();

    fixture = TestBed.createComponent(LecheForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
