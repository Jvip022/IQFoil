import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Video { id: string; titulo: string; descripcion: string; url: string; duracion: number; nivel: string; progreso?: number; completado: boolean; thumbnail?: string; }
export interface Modulo { id: string; titulo: string; videos: Video[]; completado: boolean; progreso?: number; }

@Injectable({ providedIn: 'root' })
export class ContenidoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.apiUrl}/videos/modulos`);
  }

  marcarVideoComoVisto(moduloId: string, videoId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/videos/progreso`, { moduloId, videoId, progreso: 100 });
  }

  actualizarProgreso(moduloId: string, videoId: string, progreso: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/videos/progreso`, { moduloId, videoId, progreso });
  }
}