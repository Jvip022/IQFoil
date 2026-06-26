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
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage()); // ← cargar desde localStorage
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Si hay token y no hay usuario en memoria, intentar cargar perfil
    if (this.isAuthenticated() && !this.currentUserSubject.value) {
      this.loadUserProfile();
    }
    // Si hay usuario en localStorage pero token no, limpiar
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
            // Guardar usuario en localStorage para restaurar al recargar
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
    // Si ya tenemos el usuario en memoria, devolverlo
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }
    // Si no, intentar cargar desde localStorage (fallback rápido)
    const cached = this.loadUserFromStorage();
    if (cached) {
      this.currentUserSubject.next(cached);
      this.authStatusSubject.next(true);
      // Aún así, intentar actualizar desde el backend en segundo plano
      this.refreshUserProfile();
      return of(cached);
    }
    // Si no hay caché, hacer la petición al backend
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
        // Si es 401, token inválido → desactivar autenticación
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.authStatusSubject.next(false);
          this.currentUserSubject.next(null);
        } else {
          // Para otros errores, mantener autenticación si hay token
          // y usar usuario en caché si existe
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
    // Actualizar perfil en segundo plano sin bloquear
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

  private normalizeUser(user: any): User | null {
    if (!user) return null;
    let roles: string[] = [];
    if (user.rol_id === 1) roles = ['admin'];
    else if (user.rol_id === 2) roles = ['entrenador'];
    else if (user.rol_id === 3) roles = ['atleta'];
    if (user.roles && Array.isArray(user.roles)) roles = user.roles;
    return {
      uid: user.id?.toString(),
      nombre: user.nombre,
      email: user.email,
      roles: roles,
      avatar: user.avatar || null,
      displayName: user.nombre,
      name: user.nombre,
      role: roles[0] || undefined
    };
  }
}