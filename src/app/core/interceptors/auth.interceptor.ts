import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "@core/auth/auth.service";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (
    req,
    next
) => {
    const coreAuthService = inject(AuthService);

    const accessToken = coreAuthService.getToken();

    if(!accessToken) {
        return next(req);
    }

    const cloned = req.clone({
        setHeaders: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return next(cloned).pipe(
        catchError((err: HttpErrorResponse) => {
            if(err.status === 401){
                coreAuthService.logout();
            }
            return throwError(() => err);
        })
    );
}