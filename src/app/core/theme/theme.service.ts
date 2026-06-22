import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'zootech-theme';
const DEFAULT_THEME: AppTheme = 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly currentTheme = signal<AppTheme>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private getInitialTheme(): AppTheme {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return DEFAULT_THEME;
  }

  private applyTheme(theme: AppTheme): void {
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;
  }
}
