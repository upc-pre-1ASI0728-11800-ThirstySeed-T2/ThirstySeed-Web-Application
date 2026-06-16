import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (
    !isPlatformBrowser(platformId) ||
    !req.url.startsWith(environment.apiBaseUrl) ||
    req.headers.has('Authorization')
  ) {
    return next(req);
  }

  const token = localStorage.getItem('jwtToken');

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
