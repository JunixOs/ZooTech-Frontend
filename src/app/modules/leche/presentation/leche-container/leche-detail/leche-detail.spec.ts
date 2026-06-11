import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecheDetail } from './leche-detail';

describe('LecheDetail', () => {
  let component: LecheDetail;
  let fixture: ComponentFixture<LecheDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecheDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(LecheDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
