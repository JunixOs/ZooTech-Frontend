import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRange } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-fixed-date-range',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './fixed-date-range.html',
  styleUrl: './fixed-date-range.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixedDateRangeComponent {
  label = input<string>('sanidad.reportes.fechaSeleccionada');
  startDateValue = input<string | undefined>(undefined);
  endDateValue = input<string | undefined>(undefined);

  rangeChange = output<DateRange>();

  startDate = signal<string>('');
  endDate = signal<string>('');

  constructor() {
    effect(() => {
      this.startDate.set(this.startDateValue() ?? '');
      this.endDate.set(this.endDateValue() ?? '');
    });
  }

  onStartChange(value: string): void {
    this.startDate.set(value);
    this.emitRange();
  }

  onEndChange(value: string): void {
    this.endDate.set(value);
    this.emitRange();
  }

  private emitRange(): void {
    this.rangeChange.emit({
      start: this.startDate() ? new Date(this.startDate()) : null,
      end: this.endDate() ? new Date(this.endDate()) : null,
    });
  }
}