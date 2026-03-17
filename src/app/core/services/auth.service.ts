import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated() {
    throw new Error('Method not implemented.');
    return 0;// implemented?
  }
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = 'http://localhost:3000/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  login(credentials: {email: string, password: string}): Observable<any> {
    // Simulación de login para testing
    if (credentials.email === 'usuario@ejemplo.com' && credentials.password === '123456') {
      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: { id: 1, email: credentials.email, name: 'Usuario Demo' }
      };
      
      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      this.loggedIn.next(true);
      
      return of(mockResponse);
    } else {
      // Si las credenciales no coinciden, retornar error
      return of(null).pipe(
        tap(() => {
          throw new Error('Credenciales inválidas');
        })
      );
    }

    // Para producción, descomentar esto:
    // return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
    //   tap((response: any) => {
    //     if (response.token) {
    //       localStorage.setItem('token', response.token);
    //       localStorage.setItem('user', JSON.stringify(response.user));
    //       this.loggedIn.next(true);
    //     }
    //   }),
    //   catchError(error => {
    //     console.error('Error de login:', error);
    //     throw error;
    //   })
    // );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
} 