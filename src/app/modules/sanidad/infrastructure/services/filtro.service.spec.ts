import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReporteFiltroService } from './filtro.service';

describe('ReporteFiltroService', () => {
  let service: ReporteFiltroService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 23));
    TestBed.configureTestingModule({ providers: [ReporteFiltroService] });
    service = TestBed.inject(ReporteFiltroService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('inicializa el rango por defecto con los ultimos 30 dias', () => {
    expect(service.fechaDesde()).toBe('2026-06-23');
    expect(service.fechaHasta()).toBe('2026-07-23');
  });

  it('actualiza el rango seleccionado', () => {
    service.actualizarRango('2026-07-01', '2026-07-15');

    expect(service.fechaDesde()).toBe('2026-07-01');
    expect(service.fechaHasta()).toBe('2026-07-15');
  });

  it('restaura el rango por defecto', () => {
    service.actualizarRango('2026-01-01', '2026-01-31');

    service.resetDefault();

    expect(service.fechaDesde()).toBe('2026-06-23');
    expect(service.fechaHasta()).toBe('2026-07-23');
  });
});
