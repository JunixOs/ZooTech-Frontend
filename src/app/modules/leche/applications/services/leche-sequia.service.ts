import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import {
  ConsultaFiltros,
  LECHE_REPORT_PAGE_SIZE,
  LecheRegistro,
  VacasSequiaResponse,
} from '@modules/leche/domain/models/leche.model';
import { VacasSequiaCalculator } from '@modules/leche/applications/services/vacas-sequia-calculator';
import { PaginatedResult } from '@shared/models/pagination.model';

@Injectable({ providedIn: 'root' })
export class LecheSequiaService {
  private readonly repository = inject(LecheRepository);

  private readonly cache = new Map<string, { data: unknown; ts: number }>();
  private readonly TTL = 60_000;

  private fromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.ts < this.TTL) return entry.data as T;
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: unknown): void {
    if (this.cache.size > 20) this.cache.clear();
    this.cache.set(key, { data, ts: Date.now() });
  }

  private cacheKey(prefix: string, filtros?: ConsultaFiltros): string {
    return `${prefix}${JSON.stringify(filtros ?? {})}`;
  }

  invalidateCache(): void {
    this.cache.clear();
  }

  getVacasEnSequia(filtros?: ConsultaFiltros): Observable<VacasSequiaResponse> {
    const key = this.cacheKey('sequia-v2-', filtros);
    const cached = this.fromCache<VacasSequiaResponse>(key);
    if (cached) return of(cached);

    return forkJoin({
      registros: this.fetchAllPages(filtros),
      vacunos: this.repository.getVacunos(),
    }).pipe(
      map(({ registros, vacunos }) => {
        const response = VacasSequiaCalculator.calculate(registros.items, vacunos, filtros);
        this.setCache(key, response);
        return response;
      }),
    );
  }

  private fetchAllPages(filtros?: ConsultaFiltros): Observable<PaginatedResult<LecheRegistro>> {
    const firstPageFiltros: ConsultaFiltros = {
      ...filtros,
      page: 1,
      pageSize: LECHE_REPORT_PAGE_SIZE,
    };

    return this.repository.getAll(firstPageFiltros).pipe(
      switchMap((firstPage) => {
        if (firstPage.totalPaginas <= 1) return of(firstPage);

        const pageRequests = Array.from({ length: firstPage.totalPaginas - 1 }, (_, index) =>
          this.repository.getAll({
            ...filtros,
            page: index + 2,
            pageSize: firstPage.limitePorPagina,
          }),
        );

        return forkJoin(pageRequests).pipe(
          map((remainingPages) => ({
            ...firstPage,
            items: [firstPage, ...remainingPages].flatMap((page) => page.items),
            paginaActual: 1,
          })),
        );
      }),
    );
  }
}
