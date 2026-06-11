import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-settings-container',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <h3>{{ 'settings.title' | translate }}</h3>
    <p>{{ 'settings.description' | translate }}</p>
  `
})
export class SettingsContainerComponent {}
