import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const WATER_MANAGER_ROLE = 'ROLE_WATER_MANAGER';

export const waterManagerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const token = authService.getToken();

  if (user && token && user.roles.includes(WATER_MANAGER_ROLE)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
