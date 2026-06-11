import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-users-container',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <h1>{{ 'users.title' | translate }}</h1>
    <p>{{ 'users.description' | translate }}</p>
  `
})
export class UsersContainerComponent {}
