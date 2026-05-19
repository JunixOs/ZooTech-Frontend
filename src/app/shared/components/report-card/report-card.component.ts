import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportConfig } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-report-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './report-card.component.html',
  styleUrl: './report-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportCardComponent {
  report = input.required<ReportConfig>();
}
