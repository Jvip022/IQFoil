import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Foro {
  id: string;
  titulo: string;
  descripcion: string;
  totalHilos: number;
  ultimaActividad: Date;
}

export interface Hilo {
  id: string;
  foroId: string;
  titulo: string;
  contenido: string;
  autor: string;
  fechaCreacion: Date;
  ultimaRespuesta: Date;
  respuestas: number;
  vistas: number;
}

export interface Mensaje {
  id: string;
  hiloId: string;
  autor: string;
  contenido: string;
  fecha: Date;
  avatarAutor?: string;
}

export interface Mentoria {
  id: string;
  mentor: string;
  aprendiz: string;
  area: string;
  estado: 'pendiente' | 'activa' | 'completada';
  fechaInicio?: Date;
}

@Injectable({ providedIn: 'root' })
export class ComunidadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Foros
  getForos(): Observable<Foro[]> {
    return this.http.get<Foro[]>(`${this.apiUrl}/foro`);
  }

  getForo(id: string): Observable<Foro | undefined> {
    return this.http.get<Foro | undefined>(`${this.apiUrl}/foro/${id}`);
  }

  // Hilos
  getHilos(foroId?: string): Observable<Hilo[]> {
    const url = foroId ? `${this.apiUrl}/foro/hilos?foroId=${foroId}` : `${this.apiUrl}/foro/hilos`;
    return this.http.get<Hilo[]>(url);
  }

  getHilo(id: string): Observable<Hilo | undefined> {
    return this.http.get<Hilo | undefined>(`${this.apiUrl}/foro/hilos/${id}`);
  }

  crearHilo(hilo: Partial<Hilo>): Observable<Hilo> {
    return this.http.post<Hilo>(`${this.apiUrl}/foro/hilos`, hilo);
  }

  /** Elimina un hilo por su ID (y todos sus mensajes asociados) */
  eliminarHilo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/foro/hilos/${id}`);
  }

  // Mensajes
  getMensajes(hiloId: string): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.apiUrl}/foro/hilos/${hiloId}/mensajes`);
  }

  enviarMensaje(mensaje: Partial<Mensaje>): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.apiUrl}/foro/mensajes`, mensaje);
  }

  // Mentorías
  getMentorias(usuarioId?: string): Observable<Mentoria[]> {
    const url = usuarioId ? `${this.apiUrl}/foro/mentorias?usuarioId=${usuarioId}` : `${this.apiUrl}/foro/mentorias`;
    return this.http.get<Mentoria[]>(url);
  }

  solicitarMentoria(mentoria: Partial<Mentoria>): Observable<Mentoria> {
    return this.http.post<Mentoria>(`${this.apiUrl}/foro/mentorias`, mentoria);
  }
}