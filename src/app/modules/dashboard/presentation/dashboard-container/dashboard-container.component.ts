import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-dashboard-container',
  standalone: true,
  imports: [TranslatePipe],
  template: `
<<<<<<< Updated upstream
    <h1>Dashboard</h1>
    <p>Welcome to Zootech Management System.</p>
  `,
  imports: []
=======
    <h1>{{ 'dashboard.title' | translate }}</h1>
    <p>{{ 'dashboard.welcome' | translate }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
>>>>>>> Stashed changes
})
export class DashboardContainerComponent {}
