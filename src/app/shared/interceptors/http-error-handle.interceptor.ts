import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, finalize, throwError } from 'rxjs';
import { HTTP_STATUS_CODE } from '../enum/http-status-code.enum';
import { inject } from '@angular/core';
import { GlobalHttpClientService } from '../services/global-dialog-http-client.service';

export const httpErrorRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const globalDialogService = inject(GlobalHttpClientService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log(error);

      if (error instanceof HttpErrorResponse) {
        const errorMessage = `${error.error.message}  ${error.message}`;
        if (error.status === HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR) {
          globalDialogService.showError('INTERNAL SERVER ERROR', errorMessage);
        } else if (error.status === HTTP_STATUS_CODE.BAD_REQUEST) {
          globalDialogService.showError('BAD REQUEST', errorMessage);
        } else if (error.status === HTTP_STATUS_CODE.NOT_FOUND) {
          globalDialogService.showError('NOT FOUND', errorMessage);
        } else if (error.status === HTTP_STATUS_CODE.UNAUTHORIZE) {
          globalDialogService.showError('UNAUTHORIZE', errorMessage);
        }
      }

      return throwError(() => {
        return new Error(error.message);
      });
    })
  );
};
