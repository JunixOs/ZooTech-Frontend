import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-vacuno-detail-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './vacuno-detail-section.html',
  styleUrl: './vacuno-detail-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoDetailSectionComponent {
  readonly titleKey = input.required<string>();
}
