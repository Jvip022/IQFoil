import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const rolGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return new Observable<boolean>(observer => observer.next(true));
  }

  return authService.getUser().pipe(
    map(user => {
      if (user && user.roles && requiredRoles.some(role => user.roles!.includes(role))) {
        return true;
      }
      router.navigate(['/acceso-denegado']);
      return false;
    })
  );
};