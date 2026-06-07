import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  uid?: string;
  nombre?: string;
  email?: string;
  roles?: string[];
  avatar?: string | null;
  displayName?: string;   // alias de nombre
  name?: string;          // alias de nombre
  role?: string;          // primer rol
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.isAuthenticated()) {
      this.loadUserProfile();
    }
  }

  getAuthStatus(): Observable<boolean> {
    return this.authStatusSubject.asObservable();
  }

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            this.authStatusSubject.next(true);
            const user = this.normalizeUser(response.user);
            this.currentUserSubject.next(user);
          }
        }),
        catchError(error => {
          console.error('Error en login:', error);
          throw error;
        })
      );
  }

  register(email: string, password: string, nombre: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.apiUrl}/auth/register`, { email, password, nombre })
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            this.authStatusSubject.next(true);
            const user = this.normalizeUser(response.user);
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.authStatusSubject.next(false);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): Observable<User | null> {
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }
    return this.http.get<User | null>(`${this.apiUrl}/usuarios/perfil`).pipe(
      tap(user => this.currentUserSubject.next(this.normalizeUser(user)))
    );
  }

  private loadUserProfile(): void {
    this.getUser().subscribe();
  }

  private normalizeUser(user: User | null): User | null {
    if (!user) return null;
    return {
      ...user,
      displayName: user.displayName || user.nombre,
      name: user.name || user.nombre,
      role: user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : undefined),
      avatar: user.avatar || null
    };
  }
}