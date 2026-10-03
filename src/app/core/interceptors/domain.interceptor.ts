import { HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { API_BASE_URL } from '@core/api/api.config';

export const TENANT_DOMAIN = new InjectionToken<string>('TENANT_DOMAIN', {
  providedIn: 'root',
  factory: () => window.location.hostname,
});

export const domainInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = inject(API_BASE_URL);
  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }

  const tenantDomain = inject(TENANT_DOMAIN);

  const clonedRequest = req.clone({
    setHeaders: {
      'X-Tenant-Url': tenantDomain,
    },
  });

  return next(clonedRequest);
};
