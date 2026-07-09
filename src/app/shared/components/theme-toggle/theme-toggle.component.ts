import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '@core/theme/theme.service';

type ThemeToggleVariant = 'compact' | 'menu';

@Component({
  selector: 'zt-theme-toggle',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (variant() === 'menu') {
      <button class="menu-toggle" type="button" (click)="themeService.toggleTheme()">
        <span class="menu-toggle-label">
          <i [class]="themeIcon()"></i>
          {{ 'settings.theme' | translate }}
        </span>
        <span class="menu-toggle-value">
          {{ themeValueKey() | translate }}
        </span>
      </button>
    } @else {
      <button
        class="compact-toggle"
        type="button"
        [attr.aria-label]="themeActionKey() | translate"
        [title]="themeActionKey() | translate"
        (click)="themeService.toggleTheme()"
      >
        <i [class]="themeIcon()"></i>
      </button>
    }
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .compact-toggle {
        width: var(--control-height);
        height: var(--control-height);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        background-color: var(--color-surface);
        color: var(--color-text-active);
        cursor: pointer;
        box-shadow: var(--shadow-sm);
        transition:
          border-color 0.2s ease-in-out,
          color 0.2s ease-in-out,
          background-color 0.2s ease-in-out;
      }

      .compact-toggle:hover {
        border-color: var(--color-primary-light-border);
        color: var(--color-primary);
        background-color: var(--color-primary-light);
      }

      .menu-toggle {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        padding: var(--space-2);
        border: 0;
        border-radius: var(--radius-md);
        background-color: transparent;
        color: var(--color-text-main);
        cursor: pointer;
        font-size: var(--text-sm);
        transition:
          background-color 0.2s ease-in-out,
          color 0.2s ease-in-out;
      }

      .menu-toggle:hover {
        background-color: var(--color-primary-light);
        color: var(--color-primary);
      }

      .menu-toggle-label {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-weight: 600;
      }

      .menu-toggle-value {
        color: var(--color-text-muted);
        font-size: var(--text-xs);
        font-weight: 700;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
  readonly variant = input<ThemeToggleVariant>('compact');

  themeIcon(): string {
    return this.themeService.currentTheme() === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
  }

  themeActionKey(): string {
    return this.themeService.currentTheme() === 'dark'
      ? 'settings.themeActions.light'
      : 'settings.themeActions.dark';
  }

  themeValueKey(): string {
    return this.themeService.currentTheme() === 'dark'
      ? 'settings.themeValues.dark'
      : 'settings.themeValues.light';
  }
}
