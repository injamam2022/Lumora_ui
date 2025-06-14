import { HttpInterceptorFn } from '@angular/common/http';
import { LoadingSpinnerService } from '../services/loading-spinner.service';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

export const httpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingSpinner = inject(LoadingSpinnerService);
  let requestCount = 0;
  requestCount++;
  loadingSpinner.show();
  return next(req).pipe(
    finalize(() => {
      requestCount--;
      if (requestCount === 0) {
        loadingSpinner.hide();
      }
    })
  );
};
