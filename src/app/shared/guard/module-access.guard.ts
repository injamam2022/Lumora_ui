import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const moduleAccessGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const moduleAccess = JSON.parse(localStorage.getItem('moduleAccess') || '[]');
  const controller = route.routeConfig?.path;

  // Find access for this route
  const access = moduleAccess.find((mod: any) => mod.controller_name === controller);

  if (access && access.view_status) {
    return true;
  } else {
    // Optionally, show a toast or redirect to a 'not authorized' page
    router.navigate(['/not-authorized']);
    return false;
  }
}; 