import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-page-header',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="header">
      <h2 class="title">{{ title | translate }}</h2>
      <nav class="breadcrumb">
        <span class="breadcrumb-link">{{ breadcrumbParent | translate }}</span>
        <i class="fa-solid fa-chevron-right breadcrumb-separator"></i>
        <span class="breadcrumb-active">{{ breadcrumbCurrent | translate }}</span>
      </nav>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-bottom: 0.5rem;
      margin-bottom: 1.50rem;
      border-bottom: 1px solid var(--color-border);
    }
    @media (min-width: 640px) {
      .header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
    .title {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--color-text-active);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1.1;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--color-text-muted);
    }
    .breadcrumb-link {
      cursor: pointer;
      transition: color 0.2s;
    }
    .breadcrumb-link:hover {
      color: var(--color-primary);
    }
    .breadcrumb-separator {
      font-size: 7px;
      color: var(--color-separator);
    }
    .breadcrumb-active {
      color: var(--color-text-active);
      font-weight: 600;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() breadcrumbParent: string = '';
  @Input() breadcrumbCurrent: string = '';
}