import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Guard funcional que verifica si el usuario tiene al menos uno de los roles requeridos.
 * Los roles se especifican en la configuración de la ruta con la propiedad `data: { roles: ['admin', 'entrenador'] }`.
 * Si no tiene los roles, redirige a una página de acceso denegado.
 */
export const rolGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  // Si no se especifican roles, se permite el acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    return new Observable<boolean>(observer => observer.next(true));
  }

  return authService.getUser().pipe(
    map(user => {
      if (user && user.roles && requiredRoles.some(role => user.roles!.includes(role))) {
        return true;
      }
      // Redirigir a una página de acceso denegado (debe existir en las rutas)
      router.navigate(['/acceso-denegado']);
      return false;
    })
  );
};