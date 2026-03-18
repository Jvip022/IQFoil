import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  uid?: string;
  nombre?: string;
  displayName?: string;
  avatarUrl?: string;
  roles?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;
  private currentUser: User | null = null;

  constructor() {
    this.isLoggedIn = !!localStorage.getItem('token');
    // Simula un usuario mock si está logueado
    if (this.isLoggedIn) {
      this.currentUser = {
        uid: '123',
        displayName: 'Usuario Demo',
        nombre: 'Demo',
        avatarUrl: '',
        roles: ['atleta']
      };
    }
  }

  login(username: string, password: string): Observable<boolean> {
    if (username === 'demo' && password === 'demo') {
      localStorage.setItem('token', 'fake-jwt-token');
      this.isLoggedIn = true;
      this.currentUser = {
        uid: '123',
        displayName: 'Usuario Demo',
        nombre: 'Demo',
        roles: ['atleta']
      };
      return of(true);
    }
    return of(false);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.currentUser = null;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  getAuthStatus(): Observable<boolean> {
    return of(this.isLoggedIn);
  }

  getUser(): Observable<User | null> {
    return of(this.currentUser);
  }
}