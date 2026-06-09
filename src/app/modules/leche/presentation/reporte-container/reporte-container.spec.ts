import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteContainer } from './reporte-container';

describe('ReporteContainer', () => {
  let component: ReporteContainer;
  let fixture: ComponentFixture<ReporteContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
