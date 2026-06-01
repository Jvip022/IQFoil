import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Criterio {
  id: string;
  descripcion: string;
  puntuacionMaxima: number;
}

export interface Rubrica {
  id: string;
  titulo: string;
  criterios: Criterio[];
}

export interface Evaluacion {
  id: string;
  usuarioId: string;
  rubricaId: string;
  fecha: Date;
  puntuacionTotal: number;
  puntuaciones: { criterioId: string; puntuacion: number }[];
  comentarios?: string;
  evaluador: string;
  estado: 'pendiente' | 'evaluado';
  titulo: string;
}

export interface VideoPractica {
  id: string;
  usuarioId: string;
  titulo: string;
  url: string;
  fechaSubida: Date;
  estado: 'pendiente' | 'evaluado';
  evaluacionId?: string;
}

@Injectable({ providedIn: 'root' })
export class EvaluacionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== RÚBRICAS ====================
  getRubricas(): Observable<Rubrica[]> {
    return this.http.get<Rubrica[]>(`${this.apiUrl}/evaluaciones/rubricas`);
  }

  getRubrica(id: string): Observable<Rubrica | undefined> {
    return this.http.get<Rubrica | undefined>(`${this.apiUrl}/evaluaciones/rubricas/${id}`);
  }

  crearRubrica(rubrica: Omit<Rubrica, 'id'>): Observable<Rubrica> {
    return this.http.post<Rubrica>(`${this.apiUrl}/evaluaciones/rubricas`, rubrica);
  }

  actualizarRubrica(rubrica: Rubrica): Observable<Rubrica> {
    return this.http.put<Rubrica>(`${this.apiUrl}/evaluaciones/rubricas/${rubrica.id}`, rubrica);
  }

  eliminarRubrica(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/evaluaciones/rubricas/${id}`);
  }

  // ==================== EVALUACIONES ====================
  getEvaluaciones(usuarioId?: string): Observable<Evaluacion[]> {
    const url = usuarioId ? `${this.apiUrl}/evaluaciones?usuarioId=${usuarioId}` : `${this.apiUrl}/evaluaciones`;
    return this.http.get<Evaluacion[]>(url);
  }

  getEvaluacionById(id: string): Observable<Evaluacion | undefined> {
    return this.http.get<Evaluacion | undefined>(`${this.apiUrl}/evaluaciones/${id}`);
  }

  crearEvaluacion(evaluacion: Partial<Evaluacion>): Observable<Evaluacion> {
    return this.http.post<Evaluacion>(`${this.apiUrl}/evaluaciones`, evaluacion);
  }

  guardarEvaluacion(id: string, data: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/evaluaciones/${id}`, data);
  }

  // ==================== VIDEOS PRÁCTICA ====================
  getVideosPendientes(): Observable<VideoPractica[]> {
    return this.http.get<VideoPractica[]>(`${this.apiUrl}/evaluaciones/videos-pendientes`);
  }

  subirVideo(video: Partial<VideoPractica>): Observable<VideoPractica> {
    return this.http.post<VideoPractica>(`${this.apiUrl}/evaluaciones/videos`, video);
  }

  getProgresoUsuario(usuarioId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/evaluaciones/progreso/${usuarioId}`);
  }
}