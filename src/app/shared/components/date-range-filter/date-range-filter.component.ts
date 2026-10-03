import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
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
  startValue = input('');
  endValue = input('');
  rangeChange = output<DateRange>();

  startDate = signal<string>('');
  endDate = signal<string>('');

  private readonly syncValues = effect(() => {
    this.startDate.set(this.startValue());
    this.endDate.set(this.endValue());
  });

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
      start: this.startDate() ? this.parseLocalDate(this.startDate()) : null,
      end: this.endDate() ? this.parseLocalDate(this.endDate()) : null,
    });
  }

  // Native <input type="date"> gives a "YYYY-MM-DD" string. `new Date(str)` parses
  // that as UTC midnight, which shifts a day back once read via local getters
  // (getFullYear/getDate) in any timezone behind UTC. Build the Date from local
  // parts instead so it represents the exact calendar day the user picked.
  private parseLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
