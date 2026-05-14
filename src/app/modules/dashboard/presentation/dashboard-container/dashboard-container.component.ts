import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-dashboard-container',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
    <p>{{ 'DASHBOARD.WELCOME' | translate }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent {}
