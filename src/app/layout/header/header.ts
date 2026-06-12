import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { LanguageService, SupportedLanguage } from '../../core/i18n/language.service';

@Component({
  selector: 'zt-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  hamburgerClick = output<void>();

  readonly languageService = inject(LanguageService);
  readonly languages = this.languageService.supportedLanguages;
  readonly currentLanguage = this.languageService.currentLanguage;

  changeLanguage(language: SupportedLanguage): void {
    this.languageService.use(language);
  }
}
