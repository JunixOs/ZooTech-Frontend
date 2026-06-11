import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCeloModal } from './editar-celo-modal';

describe('EditarCeloModal', () => {
  let component: EditarCeloModal;
  let fixture: ComponentFixture<EditarCeloModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarCeloModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarCeloModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
