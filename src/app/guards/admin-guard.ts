import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const { data, error } = await authService.getSession();

  if (error || !data.session) {
    return router.createUrlTree(['/admin/login']);
  }

  if (data.session.user.email !== environment.ownerEmail) {
    await authService.logout();
    return router.createUrlTree(['/admin/login']);
  }

  return true;
};