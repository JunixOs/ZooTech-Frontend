import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { API_BASE_URL } from "@core/api/api.config";
import { TenantService } from "@core/tenant/tenant.service";
import { tap } from "rxjs";

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
    let tenantService = inject(TenantService);
    let apiUrl = inject(API_BASE_URL)

    if (!req.url.startsWith(apiUrl)) {
        return next(req);
    }

    return next(req).pipe(
        tap(event => {
            if(event instanceof HttpResponse) {
                const tenantId = event.headers.get('X-Tenant-Id');
                const tenantName = event.headers.get('X-Tenant-Name');
                const tenantLegalName = event.headers.get('X-Tenant-Legal-Name');
                const appVariant = event.headers.get('X-App-Variant');

                if (tenantId === null || tenantName === null || tenantLegalName === null || appVariant === null ) {
                    throw new Error('errorNullTenantData');
                }

                const validVariants = ['admin', 'tenant'];

                if (!validVariants.includes(appVariant)) {
                    throw new Error('errorInvalidTenantAppVariant');
                }
                tenantService.setTenant(tenantId , tenantName , tenantLegalName , appVariant);
            };
        })
    );
}