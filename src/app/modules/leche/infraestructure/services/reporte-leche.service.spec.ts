import { TestBed } from '@angular/core/testing';

import { ReporteLecheService } from './reporte-leche.service';

describe('ReporteLecheService', () => {
  let service: ReporteLecheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReporteLecheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
