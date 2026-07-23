import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { describe, expect, it } from 'vitest';

import { VacunoDetailSectionComponent } from './vacuno-detail-section';

describe('VacunoDetailSectionComponent', () => {
  it('muestra el titulo y el contenido proyectado', () => {
    TestBed.configureTestingModule({
      imports: [VacunoDetailSectionComponent],
      providers: [provideTranslateService()],
    });

    const fixture = TestBed.createComponent(VacunoDetailSectionComponent);
    fixture.componentRef.setInput('titleKey', 'vacunos.detail.sections.identificacion');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h2').textContent).toContain(
      'vacunos.detail.sections.identificacion',
    );
    expect(fixture.nativeElement.querySelector('.section-card')).toBeTruthy();
  });
});
