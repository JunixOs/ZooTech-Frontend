import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CeloService } from './celo';

describe('CeloService', () => {
  let service: CeloService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CeloService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CeloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

