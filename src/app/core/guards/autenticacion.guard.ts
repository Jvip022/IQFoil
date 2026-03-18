import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional que verifica si el usuario está autenticado.
 * Si no lo está, redirige a la página de login.
 */
export const autenticacionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL intentada para redirigir después del login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};