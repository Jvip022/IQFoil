import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

// Mapeo de roles para permitir herencia
const roleAliases: Record<string, string[]> = {
  'entrenador': ['entrenador', 'entrenador_nacional', 'entrenador_provincial'],
  'admin': ['admin'],
  'atleta': ['atleta']
};

/**
 * Verifica si el usuario tiene al menos uno de los roles requeridos,
 * considerando alias (ej. 'entrenador' incluye variantes nacional/provincial).
 * Además, los administradores siempre tienen acceso (opcional).
 */
function hasRequiredRole(userRoles: string[], requiredRoles: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;

  // Si el usuario es administrador, permitir acceso (puedes eliminar esta línea si no quieres)
  if (userRoles.includes('admin')) return true;

  // Expandir roles requeridos con sus alias (ej. 'entrenador' → ['entrenador', 'entrenador_nacional', 'entrenador_provincial'])
  const expandedRequired = requiredRoles.flatMap(role => roleAliases[role] || [role]);

  return expandedRequired.some(role => userRoles.includes(role));
}

export const rolGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return of(true);
  }

  // 1. Si ya hay usuario en memoria (más rápido)
  const currentUser = authService['currentUserSubject'].value;
  if (currentUser && currentUser.roles) {
    if (hasRequiredRole(currentUser.roles, requiredRoles)) {
      return of(true);
    } else {
      router.navigate(['/acceso-denegado']);
      return of(false);
    }
  }

  // 2. Si no hay usuario pero hay token, intentar cargar perfil
  if (authService.isAuthenticated()) {
    return authService.getUser().pipe(
      take(1),
      map(user => {
        if (user && user.roles && hasRequiredRole(user.roles, requiredRoles)) {
          return true;
        }
        router.navigate(['/acceso-denegado']);
        return false;
      })
    );
  }

  // 3. No autenticado → redirigir a login
  router.navigate(['/login']);
  return of(false);
};