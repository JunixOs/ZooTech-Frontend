import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-dashboard-container',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './Dashboard-Container.Component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent {}
