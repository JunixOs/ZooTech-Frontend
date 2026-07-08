import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { TenantFormComponent } from '../tenant-form/tenant-form.component';
import { TenantUserFormComponent } from '../tenant-user-form/tenant-user-form.component';

@Component({
  selector: 'zt-admin-tenants',
  standalone: true,
  imports: [TranslatePipe, PageHeaderComponent, TenantFormComponent, TenantUserFormComponent],
  templateUrl: './admin-tenants.component.html',
  styleUrl: './admin-tenants.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTenantsComponent {}
