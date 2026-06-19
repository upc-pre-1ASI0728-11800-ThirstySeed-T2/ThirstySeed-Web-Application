import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  console.log('AUTH GUARD EJECUTADO');
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const token = authService.getToken();

  console.log('user:', user);
  console.log('token:', token);

  if (user && token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
