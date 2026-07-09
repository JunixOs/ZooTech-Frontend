import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { hasExpired } from '@shared/utils/has-expired';
import { getCurrentHostname } from './app-context';

export const authAdminGuard: CanActivateFn = () => {
  const coreAuthService = inject(AuthService);
  const router = inject(Router);

  if (!coreAuthService.hasToken()) return router.createUrlTree(['/login']);

  if (coreAuthService.userRole() !== 'Admin') return router.createUrlTree(['/login']);

  if (coreAuthService.userUrl() !== getCurrentHostname())
    return router.createUrlTree(['/login']);

  if (hasExpired(coreAuthService.expiresAt())) {
    coreAuthService.logout();
    return router.createUrlTree(['/login']);
  }

  return true;
};
