import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ReportConfig } from '@shared/models/report-config.model';
import { ReportCardComponent } from '@shared/components/report-card/report-card.component';

@Component({
  selector: 'zt-report-grid',
  standalone: true,
  imports: [ReportCardComponent, TranslatePipe],
  templateUrl: './report-grid.component.html',
  styleUrl: './report-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportGridComponent {
  reports = input.required<ReportConfig[]>();
  loading = input(false);
}
