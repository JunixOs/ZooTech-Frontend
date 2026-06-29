import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { inject } from "@angular/core";
import { hasExpired } from "@shared/utils/has-expired";

export const authAdminGuard: CanActivateFn = () => {
    const coreAuthService = inject(AuthService);
    const router = inject(Router);

    if(!coreAuthService.hasToken()) return router.createUrlTree(['/login']);

    if(coreAuthService.userRole() !== 'ADMIN') return router.createUrlTree(['/login']);

    if(hasExpired(coreAuthService.expiresAt())) {
        coreAuthService.logout();
        return router.createUrlTree(['/login'])
    }

    return true;
}