import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;

  constructor() {
    // Al iniciar, verifica si existe un token en localStorage
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  /**
   * Simula el inicio de sesión.
   * En un caso real, aquí harías una petición HTTP a tu backend.
   */
  login(username: string, password: string): Observable<boolean> {
    // Ejemplo básico: credenciales fijas
    if (username === 'demo' && password === 'demo') {
      localStorage.setItem('token', 'fake-jwt-token');
      this.isLoggedIn = true;
      return of(true);
    }
    return of(false);
  }

  /** Cierra la sesión eliminando el token */
  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
  }

  /** Retorna true si el usuario está autenticado */
  isAuthenticated(): boolean {
    // Podrías agregar validación de expiración del token aquí
    return this.isLoggedIn;
  }

  /** Observable del estado de autenticación (útil para componentes) */
  getAuthStatus(): Observable<boolean> {
    return of(this.isLoggedIn);
  }
}