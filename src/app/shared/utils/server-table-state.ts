import { signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, debounceTime } from 'rxjs';

/**
 * Page envelope returned by a server-paginated endpoint.
 */
export interface ServerTablePage<T> {
  data: T[];
  totalCount: number;
}

/**
 * Optional date range sent to the server on every fetch.
 */
export interface ServerTableDateRange {
  fechaInicio?: string;
  fechaFin?: string;
}

/**
 * Params sent to the server on every fetch (search + pagination + optional
 * date range).
 */
export interface ServerTableFetchParams extends ServerTableDateRange {
  search: string;
  page: number;
  pageSize: number;
}

/**
 * Factory that encapsulates server-side search + pagination as signals,
 * mirroring the public surface of `createTableFilterState` (searchTerm,
 * currentPage, pageSize, totalItems, onSearch, onPageChange, onPageSizeChange)
 * so container templates barely need to change when switching from
 * client-side filtering to server-driven fetches.
 *
 * Unlike `createTableFilterState`, `totalItems` and `data` are signals set
 * directly from the HTTP response, not `computed()` over a local array.
 *
 * Must be constructed within an Angular injection context (e.g. as a class
 * field initializer), since it relies on `takeUntilDestroyed()` to clean up
 * the debounced search subscription automatically.
 *
 * @param fetchPage - Called with `{ search, page, pageSize }` whenever a new
 *   page needs to be loaded; should call through to a facade method that
 *   returns an Observable of the paginated response.
 */
export function createServerTableState<T>(
  fetchPage: (params: ServerTableFetchParams) => Observable<ServerTablePage<T>>,
) {
  const searchTerm = signal('');
  const currentPage = signal(1);
  const pageSize = signal(10);
  const totalItems = signal(0);
  const data = signal<T[]>([]);
  const isLoading = signal(false);
  const dateRange = signal<ServerTableDateRange>({});

  const search$ = new Subject<string>();

  search$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((term) => {
    searchTerm.set(term);
    currentPage.set(1);
    load();
  });

  function load(): void {
    isLoading.set(true);
    fetchPage({
      search: searchTerm(),
      page: currentPage(),
      pageSize: pageSize(),
      ...dateRange(),
    }).subscribe({
      next: (result) => {
        data.set(result.data);
        totalItems.set(result.totalCount);
        isLoading.set(false);
      },
      error: () => {
        isLoading.set(false);
      },
    });
  }

  function onSearch(term: string): void {
    search$.next(term);
  }

  function onPageChange(page: number): void {
    currentPage.set(page);
    load();
  }

  function onPageSizeChange(size: number): void {
    pageSize.set(size);
    currentPage.set(1);
    load();
  }

  /**
   * Updates the server-side date range and refetches from page 1. No
   * debounce here (unlike `onSearch`): a date-range change is a deliberate,
   * discrete action (e.g. clicking "apply filters"), not incremental typing.
   */
  function onDateRangeChange(range: ServerTableDateRange): void {
    dateRange.set(range);
    currentPage.set(1);
    load();
  }

  /** Triggers the initial fetch; call from the component's `ngOnInit`. */
  function init(): void {
    load();
  }

  return {
    searchTerm,
    currentPage,
    pageSize,
    totalItems,
    data,
    isLoading,
    dateRange,
    onSearch,
    onPageChange,
    onPageSizeChange,
    onDateRangeChange,
    init,
    reload: load,
  };
}

export type ServerTableState<T> = ReturnType<typeof createServerTableState<T>>;
