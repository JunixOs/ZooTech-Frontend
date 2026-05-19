import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageChangeEvent } from '@shared/models/table-config.model';

@Component({
  selector: 'zt-paginator',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  currentPage = input.required<number>();
  pageSize = input.required<number>();
  totalItems = input.required<number>();

  pageChange = output<number>();
  pageSizeChange = output<number>();

  pageSizeOptions = [5, 10, 25, 50];

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  startItem = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);

  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  hasPrevious = computed(() => this.currentPage() > 1);
  hasNext = computed(() => this.currentPage() < this.totalPages());

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    this.pageSizeChange.emit(value);
  }
}
