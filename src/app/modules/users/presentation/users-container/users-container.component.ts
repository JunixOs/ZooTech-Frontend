import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';

@Component({
  selector: 'zt-users-container',
  standalone: true,
  imports: [TranslatePipe, PageHeaderComponent],
  template: `
    <zt-page-header
      title="users.title"
      breadcrumbParent="sidebar.users"
      breadcrumbCurrent="users.title"
    />
    <p>{{ 'users.description' | translate }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersContainerComponent {}
