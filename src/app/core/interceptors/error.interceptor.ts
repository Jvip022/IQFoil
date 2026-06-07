import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token inválido o expirado: limpiar localStorage y redirigir al login
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      // Puedes agregar más lógica para otros códigos de error (403, 500, etc.)
      return throwError(() => error);
    })
  );
};