import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { hasExpired } from "@shared/utils/has-expired";

export const authClientGuard: CanActivateFn = () => {
    const coreAuthService = inject(AuthService);
    const router = inject(Router);

    if(!coreAuthService.hasToken()) return router.createUrlTree(['/login']);

    if(coreAuthService.userRole() !== 'CLIENT') return router.createUrlTree(['/dashboard']);

    if(coreAuthService.userUrl() !== window.location.hostname) return router.createUrlTree(['/login']);

    if(hasExpired(coreAuthService.expiresAt())) {
        coreAuthService.logout();
        return router.createUrlTree(['/login'])
    }

    return true;
}