import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = () => {
    const coreAuthService = inject(AuthService);
    const router = inject(Router);

    if(coreAuthService.hasToken()) {
        return true;
    }

    return router.createUrlTree(['/login']);
}