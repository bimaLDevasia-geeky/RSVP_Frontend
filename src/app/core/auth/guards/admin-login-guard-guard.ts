import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminLoginGuardGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if(auth.isAdmin()){
    router.createUrlTree(['/admin/dashboard']);
    return false;
  }else{
    return true;
  }
};
