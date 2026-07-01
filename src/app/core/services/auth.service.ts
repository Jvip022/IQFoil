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
  displayName?: string;
  name?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.isAuthenticated() && !this.currentUserSubject.value) {
      this.loadUserProfile();
    }
    if (!this.isAuthenticated()) {
      localStorage.removeItem('user');
      this.currentUserSubject.next(null);
    }
  }

  getAuthStatus(): Observable<boolean> {
    return this.authStatusSubject.asObservable();
  }

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map(response => ({
          token: response.token,
          user: response.user
        })),
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            const user = this.normalizeUser(response.user);
            localStorage.setItem('user', JSON.stringify(user));
            this.authStatusSubject.next(true);
            this.currentUserSubject.next(user);
            console.log('✅ Token y usuario guardados correctamente');
          }
        }),
        catchError(error => {
          console.error('❌ Error en login:', error);
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
            const user = this.normalizeUser(response.user);
            localStorage.setItem('user', JSON.stringify(user));
            this.authStatusSubject.next(true);
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    const cached = this.loadUserFromStorage();
    if (cached) {
      this.currentUserSubject.next(cached);
      this.authStatusSubject.next(true);
      this.refreshUserProfile();
      return of(cached);
    }
    return this.http.get<any>(`${this.apiUrl}/usuarios/perfil`).pipe(
      map(user => this.normalizeUser(user)),
      tap(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.authStatusSubject.next(true);
        }
      }),
      catchError(error => {
        console.warn('⚠️ Error al cargar perfil:', error);
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.authStatusSubject.next(false);
          this.currentUserSubject.next(null);
        } else {
          const cachedUser = this.loadUserFromStorage();
          if (cachedUser) {
            this.currentUserSubject.next(cachedUser);
            this.authStatusSubject.next(true);
          } else {
            this.authStatusSubject.next(true);
            this.currentUserSubject.next(null);
          }
        }
        return of(null);
      })
    );
  }

  private loadUserProfile(): void {
    this.getUser().subscribe();
  }

  private refreshUserProfile(): void {
    this.http.get<any>(`${this.apiUrl}/usuarios/perfil`).pipe(
      map(user => this.normalizeUser(user)),
      tap(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    ).subscribe();
  }

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  // ============================================================
  // NORMALIZACIÓN DE USUARIO (CORREGIDO)
  // ============================================================
  private normalizeUser(user: any): User | null {
    if (!user) return null;

    // 1. Mapear rol_id a roles
    let roles: string[] = [];
    if (user.rol_id === 1) roles = ['admin'];
    else if (user.rol_id === 2) roles = ['entrenador'];
    else if (user.rol_id === 3) roles = ['atleta'];
    else if (user.rol_id === 4) roles = ['entrenador_nacional', 'entrenador']; // ✅ NUEVO
    else if (user.rol_id === 5) roles = ['entrenador_provincial', 'entrenador']; // ✅ NUEVO

    // 2. Si el backend envía roles adicionales en un array, combinarlos
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Fusionar sin duplicados
      const combined = new Set([...roles, ...user.roles]);
      roles = Array.from(combined);
    }

    return {
      uid: user.id?.toString(),
      nombre: user.nombre,
      email: user.email,
      roles: roles,
      avatar: user.avatar || null,
      displayName: user.nombre,
      name: user.nombre,
      role: roles.length > 0 ? roles[0] : undefined
    };
  }
}