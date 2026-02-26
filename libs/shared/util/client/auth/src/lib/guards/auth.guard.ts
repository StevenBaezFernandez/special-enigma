import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = (route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (session.isLoggedIn()) {
    return true;
  }

  // Redirect to login page with return url
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
