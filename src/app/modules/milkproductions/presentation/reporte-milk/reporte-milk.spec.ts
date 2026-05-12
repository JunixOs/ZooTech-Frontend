import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteMilk } from './reporte-milk';

describe('ReporteMilk', () => {
  let component: ReporteMilk;
  let fixture: ComponentFixture<ReporteMilk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteMilk],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteMilk);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
