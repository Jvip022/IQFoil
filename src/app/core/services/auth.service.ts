import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  uid?: string;
  nombre?: string;
  email?: string;
  roles?: string[];
  avatar?: string | null;
  displayName?: string;   // alias de nombre
  name?: string;          // alias de nombre
  role?: string;          // primer rol (opcional, string | undefined)
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
    // Backend devuelve { token, user }
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map(response => ({
          token: response.token,
          user: response.user
        })),
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            this.authStatusSubject.next(true);
            const user = this.normalizeUser(response.user);
            this.currentUserSubject.next(user);
            console.log('Token guardado correctamente');
          }
        }),
        catchError(error => {
          console.error('Error en login:', error);
          throw error;
        })
      );
  }

  register(email: string, password: string, nombre: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/auth/register`, { email, password, nombre })
      .pipe(
        map(response => ({
          token: response.token,
          user: response.user
        })),
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
    return this.http.get<any>(`${this.apiUrl}/usuarios/perfil`).pipe(
      tap(user => this.currentUserSubject.next(this.normalizeUser(user)))
    );
  }

  private loadUserProfile(): void {
    this.getUser().subscribe();
  }

  private normalizeUser(user: any): User | null {
    if (!user) return null;
    // Convertir rol_id (número) a array de roles (string)
    let roles: string[] = [];
    if (user.rol_id === 1) roles = ['admin'];
    else if (user.rol_id === 2) roles = ['entrenador'];
    else if (user.rol_id === 3) roles = ['atleta'];
    // Si ya viene como array, usarlo
    if (user.roles && Array.isArray(user.roles)) roles = user.roles;
    return {
      uid: user.id?.toString(),
      nombre: user.nombre,
      email: user.email,
      roles: roles,
      avatar: user.avatar || null,
      displayName: user.nombre,
      name: user.nombre,
      role: roles[0] || undefined   // ← cambia null por undefined
    };
  }
}