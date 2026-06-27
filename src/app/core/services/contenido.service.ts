import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Video {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  duracion: number;
  nivel: string;
  progreso?: number;
  completado: boolean;
  thumbnail?: string;
  tipo?: 'tutorial' | 'practica';
}
export interface Modulo {
  id: string;
  titulo: string;
  videos: Video[];
  completado: boolean;
  progreso?: number;
}

@Injectable({ providedIn: 'root' })
export class ContenidoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.apiUrl}/videos/modulos`);
  }

  marcarVideoComoVisto(moduloId: string, videoId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/videos/progreso`, { moduloId, videoId, progreso: 100 });
  }
  subirVideo(formData: FormData): Observable<Video> {
    return this.http.post<Video>(`${this.apiUrl}/videos/`, formData);
  }

  actualizarProgreso(videoId: string, progreso: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/videos/progreso`, { videoId, progreso });
  }



  eliminarVideo(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/videos/${id}`);
  }


  getProgresoUsuario(usuarioId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/progreso/${usuarioId}`);
  }

  getUpcomingEventsForUser(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/eventos/proximos/${usuarioId}`);
  }

  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/estadisticas`);
  }
  getVideosPractica(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/videos/practicas`);
  }
  inscribirseEvento(eventoId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/eventos/${eventoId}/inscribirse`, {});
  }
}