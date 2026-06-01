import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from './auth.service';

export interface PreferenciasUsuario { idioma: string; notificacionesEmail: boolean; tema: 'claro' | 'oscuro' | 'sistema'; }

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPerfil(): Observable<User | null> {
    return this.http.get<User | null>(`${this.apiUrl}/usuarios/perfil`);
  }

  actualizarPerfil(perfil: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/usuarios/perfil`, perfil);
  }

  getPreferencias(): Observable<PreferenciasUsuario> {
    return this.http.get<PreferenciasUsuario>(`${this.apiUrl}/usuarios/preferencias`);
  }

  actualizarPreferencias(pref: Partial<PreferenciasUsuario>): Observable<PreferenciasUsuario> {
    return this.http.put<PreferenciasUsuario>(`${this.apiUrl}/usuarios/preferencias`, pref);
  }

  subirAvatar(imagen: File): Observable<string> {
    const formData = new FormData();
    formData.append('avatar', imagen);
    return this.http.post<string>(`${this.apiUrl}/usuarios/avatar`, formData);
  }

  cambiarPassword(oldPass: string, newPass: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/usuarios/cambiar-password`, { oldPass, newPass });
  }
}