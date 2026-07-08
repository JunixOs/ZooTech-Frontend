import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { LocalStorage } from '@core/store/local.store';
import { TenantService } from '@core/tenant/tenant.service';

export type AppTheme = 'light' | 'dark';
export type AppVariant = 'tenant' | 'admin';

const THEME_STORAGE_KEY = 'zootech-theme';
const APP_VARIANT_STORAGE_KEY = 'zootech-app-variant';

const DEFAULT_THEME: AppTheme = 'light';
const DEFAULT_APP_VARIANT: AppVariant = 'tenant';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly tenantService = inject(TenantService);
  private readonly localStore = inject(LocalStorage);

  readonly currentTheme = signal<AppTheme>(this.getInitialTheme());

  readonly currentApp = signal<AppVariant>(this.getInitialAppVariant());

  constructor() {
    this.setAppVariant(this.currentApp());
    this.applyTheme(this.currentTheme(), this.currentApp());
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    this.localStore.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme, this.currentApp());
  }

  setAppVariant(appVariant: AppVariant) {
    this.currentApp.set(appVariant);
    this.localStore.setItem(APP_VARIANT_STORAGE_KEY, appVariant);
    this.applyTheme(this.currentTheme(), appVariant);
  }

  private getInitialTheme(): AppTheme {
    const storedTheme = this.localStore.getItem(THEME_STORAGE_KEY);

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return DEFAULT_THEME;
  }

  private getInitialAppVariant(): AppVariant {
    const tenantAppVariant = this.tenantService.getCurrentApp();

    if (tenantAppVariant === 'admin' || tenantAppVariant === 'tenant') {
      return tenantAppVariant;
    }

    return DEFAULT_APP_VARIANT;
  }

  private applyTheme(theme: AppTheme, appVariant: AppVariant): void {
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.dataset['app'] = appVariant;

    this.document.documentElement.style.colorScheme = theme;
  }
}
