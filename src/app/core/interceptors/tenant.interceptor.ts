import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '@core/api/api.config';
import { TenantService } from '@core/tenant/tenant.service';
import { AppVariant, ThemeService } from '@core/theme/theme.service';
import { tap } from 'rxjs';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  const themeService = inject(ThemeService);
  const apiUrl = inject(API_BASE_URL);

  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const tenantId = event.headers.get('X-Tenant-Id');
        const tenantName = event.headers.get('X-Tenant-Name');
        const tenantLegalName = event.headers.get('X-Tenant-Legal-Name');
        const tenantType = event.headers.get('X-Tenant-Type');

        if (
          tenantId === null ||
          tenantName === null ||
          tenantLegalName === null ||
          tenantType === null
        ) {
          return;
        }

        const appVariant = mapTenantTypeToAppVariant(tenantType);

        if (appVariant === null) {
          throw new Error('errorInvalidTenantAppVariant');
        }
        tenantService.setTenant(tenantId, tenantName, tenantLegalName, appVariant);
        themeService.setAppVariant(appVariant);
      }
    }),
  );
};

function mapTenantTypeToAppVariant(tenantType: string): AppVariant | null {
  if (tenantType === 'Admin') {
    return 'admin';
  }

  if (tenantType === 'Tenant') {
    return 'tenant';
  }

  return null;
}
