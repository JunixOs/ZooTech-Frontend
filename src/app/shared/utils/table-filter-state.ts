import { computed, signal } from '@angular/core';
import { DateRange } from '@shared/models/report-config.model';

/**
 * Factory that encapsulates the common filter + pagination signal pattern
 * shared across table container components.
 *
 * @param filteredData - A reactive getter (signal or computed accessor) that
 *   returns the already-filtered dataset. Pagination is applied on top of it.
 */
export function createTableFilterState<T>(filteredData: () => T[]) {
  const searchTerm = signal('');
  const dateRange = signal<DateRange>({ start: null, end: null });
  const currentPage = signal(1);
  const pageSize = signal(10);

  const totalItems = computed(() => filteredData().length);

  const paginatedData = computed(() => {
    const start = (currentPage() - 1) * pageSize();
    return filteredData().slice(start, start + pageSize()) as Record<string, unknown>[];
  });

  function onSearch(term: string): void {
    searchTerm.set(term);
    currentPage.set(1);
  }

  function onDateRangeChange(range: DateRange): void {
    dateRange.set(range);
    currentPage.set(1);
  }

  function onPageChange(page: number): void {
    currentPage.set(page);
  }

  function onPageSizeChange(size: number): void {
    pageSize.set(size);
    currentPage.set(1);
  }

  return {
    searchTerm,
    dateRange,
    currentPage,
    pageSize,
    totalItems,
    paginatedData,
    onSearch,
    onDateRangeChange,
    onPageChange,
    onPageSizeChange,
  };
}

export type TableFilterState = ReturnType<typeof createTableFilterState>;
