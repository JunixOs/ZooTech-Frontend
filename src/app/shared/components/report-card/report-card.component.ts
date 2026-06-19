import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReportConfig } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-report-card',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: './report-card.component.html',
  styleUrl: './report-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportCardComponent {
  report = input.required<ReportConfig>();

  handleClick() {
    if (this.report().onOpen) {
      this.report().onOpen!();
    }
  }
}
