import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLanguage = 'es' | 'en' | 'pt';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  shortLabel: string;
}

const STORAGE_KEY = 'zootech.lang';
const FALLBACK_LANGUAGE: SupportedLanguage = 'es';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly supportedLanguages: LanguageOption[] = [
    { code: 'es', label: 'Español', shortLabel: 'ES' },
    { code: 'en', label: 'English', shortLabel: 'EN' },
    { code: 'pt', label: 'Português', shortLabel: 'PT' },
  ];

  readonly currentLanguage = signal<SupportedLanguage>(FALLBACK_LANGUAGE);

  constructor(private readonly translate: TranslateService) {
    this.translate.setDefaultLang(FALLBACK_LANGUAGE);

    const savedLanguage = this.normalizeLanguage(
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('lang'),
    );

    this.use(savedLanguage);
  }

  use(language: SupportedLanguage): void {
    const normalized = this.normalizeLanguage(language);

    this.currentLanguage.set(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
    this.translate.use(normalized);
  }

  private normalizeLanguage(language: string | null): SupportedLanguage {
    if (language === 'en' || language === 'pt' || language === 'es') {
      return language;
    }

    return FALLBACK_LANGUAGE;
  }
}
