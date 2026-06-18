import { HttpInterceptorFn } from "@angular/common/http";

export const domainInterceptor: HttpInterceptorFn = (
  req,
  next
) => {
  const tenantDomain = window.location.hostname;

  const clonedRequest = req.clone({
    setHeaders: {
      'X-Tenant': tenantDomain
    }
  });

  return next(clonedRequest);
}
