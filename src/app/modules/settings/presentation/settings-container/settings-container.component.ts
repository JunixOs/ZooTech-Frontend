import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';

@Component({
  selector: 'zt-settings-container',
  standalone: true,
  imports: [TranslatePipe, PageHeaderComponent],
  template: `
    <zt-page-header
      title="settings.title"
      breadcrumbParent="sidebar.settings"
      breadcrumbCurrent="settings.title"
    />
    <p>{{ 'settings.description' | translate }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsContainerComponent {}
