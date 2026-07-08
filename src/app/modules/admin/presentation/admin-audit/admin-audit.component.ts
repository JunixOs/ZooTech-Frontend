import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';

@Component({
  selector: 'zt-admin-audit',
  standalone: true,
  imports: [TranslatePipe, PageHeaderComponent],
  templateUrl: './admin-audit.component.html',
  styleUrl: './admin-audit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAuditComponent {}
