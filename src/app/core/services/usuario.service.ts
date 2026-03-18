import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from './auth.service'; // Ajusta la ruta si es necesario

export interface PreferenciasUsuario {
  idioma: string;
  notificacionesEmail: boolean;
  tema: 'claro' | 'oscuro' | 'sistema';
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private perfilMock: User = {
    uid: '123',
    displayName: 'Usuario Demo',
    nombre: 'Demo',
    avatarUrl: '',
    roles: ['atleta']
  };

  private preferenciasMock: PreferenciasUsuario = {
    idioma: 'es',
    notificacionesEmail: true,
    tema: 'sistema'
  };

  constructor() {}

  /** Obtiene el perfil del usuario actual */
  getPerfil(): Observable<User | null> {
    return of(this.perfilMock).pipe(delay(300));
  }

  /** Actualiza el perfil del usuario */
  actualizarPerfil(perfil: Partial<User>): Observable<User> {
    this.perfilMock = { ...this.perfilMock, ...perfil };
    return of(this.perfilMock).pipe(delay(500));
  }

  /** Obtiene las preferencias del usuario */
  getPreferencias(): Observable<PreferenciasUsuario> {
    return of(this.preferenciasMock).pipe(delay(300));
  }

  /** Actualiza las preferencias */
  actualizarPreferencias(pref: Partial<PreferenciasUsuario>): Observable<PreferenciasUsuario> {
    this.preferenciasMock = { ...this.preferenciasMock, ...pref };
    return of(this.preferenciasMock).pipe(delay(400));
  }

  /** Sube una foto de avatar (simulado) */
  subirAvatar(imagen: File): Observable<string> {
    console.log('Subiendo avatar...', imagen.name);
    return of(URL.createObjectURL(imagen)).pipe(delay(800));
  }

  /** Cambia la contraseña (simulado) */
  cambiarPassword(oldPass: string, newPass: string): Observable<boolean> {
    console.log('Cambiando contraseña');
    return of(true).pipe(delay(500));
  }

  /** Obtiene la lista de roles del usuario */
  getRoles(): Observable<string[]> {
    return of(this.perfilMock.roles || []).pipe(delay(200));
  }
}