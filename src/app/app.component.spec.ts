import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AppComponent } from './app.component';
import { ThemeService } from '@core/theme/theme.service';

describe('AppComponent', () => {
  it('initializes the theme service when the app starts', async () => {
    const themeServiceFactory = vi.fn(() => ({}));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useFactory: themeServiceFactory },
      ],
    }).compileComponents();

    TestBed.createComponent(AppComponent);

    expect(themeServiceFactory).toHaveBeenCalledOnce();
  });
});
