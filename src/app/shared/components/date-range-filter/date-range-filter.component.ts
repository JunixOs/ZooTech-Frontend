import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRange } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-date-range-filter',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './date-range-filter.component.html',
  styleUrl: './date-range-filter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeFilterComponent {
  label = input.required<string>();
  rangeChange = output<DateRange>();

  startDate = signal<string>(this.toInputDate(this.daysAgo(30)));
  endDate = signal<string>(this.toInputDate(new Date()));

  private daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private toInputDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    this.emitRange();
  }

  onStartChange(value: string): void {
    this.startDate.set(value);
    if (this.endDate()) this.emitRange();
  }

  onEndChange(value: string): void {
    this.endDate.set(value);
    this.emitRange();
  }

  onClear(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.rangeChange.emit({ start: null, end: null });
  }

  private emitRange(): void {
    this.rangeChange.emit({
      start: this.startDate() ? new Date(this.startDate()) : null,
      end: this.endDate() ? new Date(this.endDate()) : null,
    });
  }
}
