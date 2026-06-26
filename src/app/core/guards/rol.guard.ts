import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const rolGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return of(true);
  }

  // Primero, si ya hay usuario en memoria, usarlo
  const currentUser = authService['currentUserSubject'].value;
  if (currentUser && currentUser.roles) {
    if (requiredRoles.some(role => currentUser.roles!.includes(role))) {
      return of(true);
    } else {
      router.navigate(['/acceso-denegado']);
      return of(false);
    }
  }

  // Si no hay usuario pero hay token, intentar cargar perfil
  if (authService.isAuthenticated()) {
    return authService.getUser().pipe(
      take(1),
      map(user => {
        if (user && user.roles && requiredRoles.some(role => user.roles!.includes(role))) {
          return true;
        }
        router.navigate(['/acceso-denegado']);
        return false;
      })
    );
  }

  // No autenticado
  router.navigate(['/login']);
  return of(false);
};