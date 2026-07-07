import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { API_BASE_URL } from "@core/api/api.config";

export const domainInterceptor: HttpInterceptorFn = (
  req,
  next
) => {
  let apiUrl = inject(API_BASE_URL)

  if (!req.url.startsWith(apiUrl)) {
      return next(req);
  }
  
  const tenantDomain = window.location.hostname;

  const clonedRequest = req.clone({
    setHeaders: {
      'X-Tenant-Url': tenantDomain
    }
  });

  return next(clonedRequest);
}
