import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-dashboard-container',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <h1>{{ 'dashboard.title' | translate }}</h1>
    <p>{{ 'dashboard.welcome' | translate }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent {}
