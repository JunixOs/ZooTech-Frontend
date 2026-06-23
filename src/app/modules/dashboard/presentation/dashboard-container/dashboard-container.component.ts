import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-dashboard-container',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dashboard-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent { }
