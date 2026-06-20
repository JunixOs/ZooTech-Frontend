import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'es' | 'en' | 'pt' | 'fr';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  shortLabel: string;
}

const LANGUAGE_STORAGE_KEY = 'zootech-language';
const DEFAULT_LANGUAGE: AppLanguage = 'es';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly languages: LanguageOption[] = [
    { code: 'es', label: 'Español', shortLabel: 'ES' },
    { code: 'en', label: 'English', shortLabel: 'EN' },
    { code: 'pt', label: 'Português', shortLabel: 'PT' },
    { code: 'fr', label: 'Français', shortLabel: 'FR' },
  ];

  readonly currentLanguage = signal<AppLanguage>(this.getInitialLanguage());

  constructor() {
    this.translate.addLangs(this.languages.map((language) => language.code));
    this.translate.setFallbackLang(DEFAULT_LANGUAGE);
    this.translate.use(this.currentLanguage());
  }

  setLanguage(language: AppLanguage): void {
    this.currentLanguage.set(language);
    this.translate.use(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }

  getCurrentOption(): LanguageOption {
    return (
      this.languages.find((language) => language.code === this.currentLanguage()) ??
      this.languages[0]
    );
  }

  private getInitialLanguage(): AppLanguage {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (this.isSupportedLanguage(storedLanguage)) {
      return storedLanguage;
    }

    const browserLanguage = navigator.language.slice(0, 2);

    if (this.isSupportedLanguage(browserLanguage)) {
      return browserLanguage;
    }

    return DEFAULT_LANGUAGE;
  }

  private isSupportedLanguage(language: string | null): language is AppLanguage {
    return this.languages.some((option) => option.code === language);
  }
}
