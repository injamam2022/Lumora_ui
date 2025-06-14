import { HttpInterceptorFn } from '@angular/common/http';

export const httpTokenRequestInterceptor: HttpInterceptorFn = (req, next) => {
  let tokenData: null | string;
  if (typeof window != 'undefined') {
    tokenData = localStorage.getItem('authToken');

    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${tokenData}`),
    });
    return next(authReq);
  }
  return next(req);
};
