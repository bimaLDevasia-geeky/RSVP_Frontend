import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

  

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isUser()) return true;
  if (auth.isAdmin()) return router.createUrlTree(['/admin']);
  return router.createUrlTree(['/login']);
};


