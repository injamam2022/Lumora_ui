import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginHttpClientService } from '../../login/service/login-http-client.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginHttpClientService = inject(LoginHttpClientService);
  const router = inject(Router);
  if (loginHttpClientService.isAuthenticatedUser()) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};
