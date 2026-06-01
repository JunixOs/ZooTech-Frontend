import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

const canAccess = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const authGuard: CanActivateFn = () => canAccess();
export const authChildGuard: CanActivateChildFn = () => canAccess();
