import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const token = authService.getToken();

  if (user && token && user.roles.includes('ROLE_ADMIN')) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
