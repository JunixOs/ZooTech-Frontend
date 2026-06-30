import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AppLanguage, LanguageService } from '@core/i18n/language.service';

type LanguageSelectorVariant = 'compact' | 'menu';

@Component({
  selector: 'zt-language-selector',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (variant() === 'menu') {
      <section class="menu-section">
        <span class="menu-label">{{ 'settings.language' | translate }}</span>
        <div class="menu-options">
          @for (language of languageService.languages; track language.code) {
            <button
              class="menu-option"
              type="button"
              [class.menu-option-active]="language.code === languageService.currentLanguage()"
              (click)="selectLanguage(language.code)"
            >
              <span class="check-mark">
                @if (language.code === languageService.currentLanguage()) {
                  <i class="fa-solid fa-check"></i>
                }
              </span>
              <span>{{ language.label }}</span>
            </button>
          }
        </div>
      </section>
    } @else {
      <div class="compact-selector">
        <button
          class="compact-button"
          type="button"
          [attr.aria-expanded]="open()"
          [attr.aria-label]="'settings.language' | translate"
          (click)="toggleOpen($event)"
        >
          <i class="fa-solid fa-globe"></i>
          <span>{{ languageService.getCurrentOption().shortLabel }}</span>
          <i class="fa-solid fa-chevron-down chevron-icon"></i>
        </button>

        @if (open()) {
          <div class="language-popover">
            @for (language of languageService.languages; track language.code) {
              <button
                class="language-option"
                type="button"
                [class.language-option-active]="language.code === languageService.currentLanguage()"
                (click)="selectLanguage(language.code)"
              >
                <span class="check-mark">
                  @if (language.code === languageService.currentLanguage()) {
                    <i class="fa-solid fa-check"></i>
                  }
                </span>
                <span>{{ language.label }}</span>
              </button>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .compact-selector {
        position: relative;
      }

      .compact-button {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        height: var(--control-height);
        padding: 0 var(--space-3);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        background-color: var(--color-surface);
        color: var(--color-text-active);
        cursor: pointer;
        font-size: var(--text-xs);
        font-weight: 700;
        box-shadow: var(--shadow-sm);
        transition:
          border-color 0.2s ease-in-out,
          color 0.2s ease-in-out,
          background-color 0.2s ease-in-out;
      }

      .compact-button:hover {
        border-color: var(--color-primary-light-border);
        color: var(--color-primary);
        background-color: var(--color-primary-light);
      }

      .chevron-icon {
        font-size: var(--text-xxs);
      }

      .language-popover {
        position: absolute;
        top: calc(100% + var(--space-2));
        right: 0;
        z-index: 20;
        min-width: 10.75rem;
        padding: var(--space-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        background-color: var(--color-surface);
        box-shadow: var(--shadow-md);
      }

      .language-option,
      .menu-option {
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--space-2);
        border: 0;
        border-radius: var(--radius-md);
        background-color: transparent;
        color: var(--color-text-main);
        cursor: pointer;
        font-size: var(--text-sm);
        text-align: left;
        transition:
          background-color 0.2s ease-in-out,
          color 0.2s ease-in-out;
      }

      .language-option {
        padding: var(--space-2) var(--space-3);
      }

      .language-option:hover,
      .menu-option:hover,
      .language-option-active,
      .menu-option-active {
        background-color: var(--color-primary-light);
        color: var(--color-primary);
      }

      .check-mark {
        width: var(--space-4);
        color: var(--color-primary);
        font-size: var(--text-xs);
      }

      .menu-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .menu-label {
        color: var(--color-text-muted);
        font-size: var(--text-xs);
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .menu-options {
        display: grid;
        gap: var(--space-1);
      }

      .menu-option {
        padding: var(--space-2);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectorComponent {
  readonly languageService = inject(LanguageService);
  readonly variant = input<LanguageSelectorVariant>('compact');
  readonly open = signal(false);

  @HostListener('document:click')
  closeFromOutside(): void {
    this.open.set(false);
  }

  toggleOpen(event: MouseEvent): void {
    event.stopPropagation();
    this.open.update((isOpen) => !isOpen);
  }

  selectLanguage(language: AppLanguage): void {
    this.languageService.setLanguage(language);
    this.open.set(false);
  }
}
