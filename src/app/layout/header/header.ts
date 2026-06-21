import { ChangeDetectionStrategy, Component, HostListener, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '@shared/components/language-selector/language-selector.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'zt-header',
  imports: [LanguageSelectorComponent, ThemeToggleComponent, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  hamburgerClick = output<void>();
  userMenuOpen = signal(false);

  @HostListener('document:click')
  closeUserMenuFromOutside(): void {
    this.userMenuOpen.set(false);
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen.update((open) => !open);
  }
}
