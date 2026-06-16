import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-page-header',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="header">
      <h2 class="title">{{ title | translate }}</h2>
      <span class="text-sm text-gray-400">{{ breadcrumb | translate }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
      }
      .title {
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--color-text-active);
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() breadcrumb: string = '';
}
