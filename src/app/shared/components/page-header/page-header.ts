import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '@shared/components/language-selector/language-selector.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'zt-page-header',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LanguageSelectorComponent, ThemeToggleComponent],
  template: `
    <div class="header">
      <h2 class="title">{{ title | translate }}</h2>
      <div class="header-trail">
        <nav class="breadcrumb" [attr.aria-label]="'settings.breadcrumb' | translate">
          @if (breadcrumbParentRoute) {
            <a class="breadcrumb-parent breadcrumb-nav" [routerLink]="breadcrumbParentRoute">
              {{ breadcrumbParent | translate }}
            </a>
          } @else {
            <span class="breadcrumb-parent">{{ breadcrumbParent | translate }}</span>
          }
          @if (breadcrumbMiddle) {
            <i class="fa-solid fa-chevron-right breadcrumb-separator"></i>
            @if (breadcrumbMiddleRoute) {
              <a class="breadcrumb-link breadcrumb-nav" [routerLink]="breadcrumbMiddleRoute">
                {{ breadcrumbMiddle | translate }}
              </a>
            } @else {
              <span class="breadcrumb-link">{{ breadcrumbMiddle | translate }}</span>
            }
          }
          <i class="fa-solid fa-chevron-right breadcrumb-separator"></i>
          <span class="breadcrumb-active">{{ breadcrumbCurrent | translate }}</span>
        </nav>

        <div class="global-actions">
          <span class="actions-separator" aria-hidden="true"></span>
          <zt-language-selector />
          <zt-theme-toggle />
        </div>
      </div>
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
        flex-direction: column;
        gap: 0.5rem;
        padding-bottom: 0.5rem;
        margin-bottom: 1.5rem;
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
      .header-trail {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        min-width: 0;
      }
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: var(--text-xs);
        font-weight: 500;
        color: var(--color-text-muted);
        min-width: 0;
      }
      .breadcrumb-parent {
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-weight: 600;
      }
      .breadcrumb-link,
      .breadcrumb-parent {
        transition: color 0.2s;
      }
      .breadcrumb-nav {
        text-decoration: none;
        color: inherit;
        cursor: pointer;
      }
      .breadcrumb-nav:hover {
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
      .global-actions {
        display: none;
        align-items: center;
        gap: var(--space-2);
        flex-shrink: 0;
      }
      .actions-separator {
        width: 1px;
        height: var(--space-6);
        background-color: var(--color-separator);
        opacity: 0.75;
        margin: 0 var(--space-1);
      }
      @media (min-width: 768px) {
        .global-actions {
          display: flex;
        }
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() breadcrumbParent: string = '';
  @Input() breadcrumbParentRoute?: string;
  @Input() breadcrumbMiddle: string = '';
  @Input() breadcrumbMiddleRoute?: string;
  @Input() breadcrumbCurrent: string = '';
}
