import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';

@Component({
  selector: 'zt-admin-parameters',
  standalone: true,
  imports: [TranslatePipe, PageHeaderComponent],
  templateUrl: './admin-parameters.component.html',
  styleUrl: './admin-parameters.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminParametersComponent {}
