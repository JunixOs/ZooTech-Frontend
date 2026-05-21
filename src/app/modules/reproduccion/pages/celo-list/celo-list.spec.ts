import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CeloList } from './celo-list';

describe('CeloList', () => {
  let component: CeloList;
  let fixture: ComponentFixture<CeloList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CeloList],
    }).compileComponents();

    fixture = TestBed.createComponent(CeloList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
