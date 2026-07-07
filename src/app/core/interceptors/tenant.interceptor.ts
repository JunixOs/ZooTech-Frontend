import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '@core/tenant/tenant.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantId = inject(TenantService).getTenantId();
  if (tenantId) {
    req = req.clone({
      setHeaders: { 'X-Tenant-ID': tenantId },
    });
  }
  return next(req);
};
