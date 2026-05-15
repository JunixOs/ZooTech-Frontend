import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRange } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-date-range-filter',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './date-range-filter.component.html',
  styleUrl: './date-range-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeFilterComponent {
  label = input.required<string>();
  rangeChange = output<DateRange>();

  startDate = signal<string>('');
  endDate = signal<string>('');

  onStartChange(value: string): void {
    this.startDate.set(value);
    this.emitRange();
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
