import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BackButtonComponent } from './back-button';

describe('BackButtonComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BackButtonComponent],
      providers: [provideRouter([]), provideTranslateService()],
    });
  });

  it('mantiene la navegación habilitada por defecto', () => {
    const fixture = TestBed.createComponent(BackButtonComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentRef.setInput('route', '/reproduccion/fecundacion');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();

    expect(navigateSpy).toHaveBeenCalledWith(['/reproduccion/fecundacion']);
  });

  it('bloquea la navegación cuando está deshabilitado', () => {
    const fixture = TestBed.createComponent(BackButtonComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(button.disabled).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
