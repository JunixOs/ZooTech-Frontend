import { ChangeDetectionStrategy, Component, input, output, signal, OnInit } from '@angular/core';
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
export class DateRangeFilterComponent implements OnInit {
  label = input.required<string>();
  rangeChange = output<DateRange>();

  initialStart = input<string>('');
  initialEnd = input<string>('');

  startDate = signal<string>('');
  endDate = signal<string>('');

  ngOnInit(): void {
    if (this.initialStart()) {
      this.startDate.set(this.initialStart());
      this.emitRange();
    }
    if (this.initialEnd()) {
      this.endDate.set(this.initialEnd());
      this.emitRange();
    }
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

  private parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  private emitRange(): void {
    this.rangeChange.emit({
      start: this.parseLocalDate(this.startDate()),
      end: this.parseLocalDate(this.endDate()),
    });
  }
}