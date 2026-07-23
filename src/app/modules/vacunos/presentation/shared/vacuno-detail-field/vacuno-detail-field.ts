import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-vacuno-detail-field',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './vacuno-detail-field.html',
  styleUrl: './vacuno-detail-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoDetailFieldComponent {
  readonly labelKey = input.required<string>();
  readonly value = input<string | number | null | undefined>('');
  readonly icon = input('');
  readonly emptyValue = input('');

  readonly displayValue = computed(() => {
    const value = this.value();
    return value === null || value === undefined || value === ''
      ? this.emptyValue()
      : String(value);
  });
}
