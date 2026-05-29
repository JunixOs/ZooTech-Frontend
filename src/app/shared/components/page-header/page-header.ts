import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-page-header',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="header">
      <h2 class="m-0 text-[1.1rem] font-bold uppercase tracking-wide text-slate-800">{{ title | translate }}</h2>
      <span class="text-sm text-gray-400">{{ breadcrumb | translate }}</span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() breadcrumb: string = '';
}