import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Rubrica {
  id: string;
  titulo: string;
  criterios: Criterio[];
}

export interface Criterio {
  id: string;
  descripcion: string;
  puntuacionMaxima: number;
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

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {
  private rubricasMock: Rubrica[] = [
    {
      id: '1',
      titulo: 'Técnica de virada',
      criterios: [
        { id: '101', descripcion: 'Posición del cuerpo', puntuacionMaxima: 5 },
        { id: '102', descripcion: 'Timming', puntuacionMaxima: 5 },
        { id: '103', descripcion: 'Coordinación', puntuacionMaxima: 5 }
      ]
    }
  ];

  private evaluacionesMock: Evaluacion[] = [
    {
      id: '1',
      usuarioId: '123',
      rubricaId: '1',
      fecha: new Date(Date.now() - 86400000),
      puntuacionTotal: 13,
      puntuaciones: [
        { criterioId: '101', puntuacion: 4 },
        { criterioId: '102', puntuacion: 5 },
        { criterioId: '103', puntuacion: 4 }
      ],
      evaluador: 'Admin'
    }
  ];

  private videosMock: VideoPractica[] = [
    {
      id: '1',
      usuarioId: '123',
      titulo: 'Mi práctica de virada',
      url: 'https://example.com/video.mp4',
      fechaSubida: new Date(Date.now() - 172800000),
      estado: 'evaluado',
      evaluacionId: '1'
    },
    {
      id: '2',
      usuarioId: '456',
      titulo: 'Ejercicio de ceñida',
      url: 'https://example.com/video2.mp4',
      fechaSubida: new Date(Date.now() - 3600000),
      estado: 'pendiente'
    }
  ];

  constructor() {}

  // Rúbricas
  getRubricas(): Observable<Rubrica[]> {
    return of(this.rubricasMock).pipe(delay(400));
  }

  getRubrica(id: string): Observable<Rubrica | undefined> {
    return of(this.rubricasMock.find(r => r.id === id)).pipe(delay(200));
  }

  // Evaluaciones
  getEvaluaciones(usuarioId?: string): Observable<Evaluacion[]> {
    if (usuarioId) {
      return of(this.evaluacionesMock.filter(e => e.usuarioId === usuarioId)).pipe(delay(500));
    }
    return of(this.evaluacionesMock).pipe(delay(500));
  }

  crearEvaluacion(evaluacion: Partial<Evaluacion>): Observable<Evaluacion> {
    const nueva: Evaluacion = {
      id: Date.now().toString(),
      usuarioId: evaluacion.usuarioId || '',
      rubricaId: evaluacion.rubricaId || '',
      fecha: new Date(),
      puntuacionTotal: evaluacion.puntuacionTotal || 0,
      puntuaciones: evaluacion.puntuaciones || [],
      evaluador: evaluacion.evaluador || 'Evaluador'
    };
    this.evaluacionesMock.push(nueva);
    return of(nueva).pipe(delay(600));
  }

  // Videos de práctica
  getVideosPendientes(): Observable<VideoPractica[]> {
    return of(this.videosMock.filter(v => v.estado === 'pendiente')).pipe(delay(400));
  }

  subirVideo(video: Partial<VideoPractica>): Observable<VideoPractica> {
    const nuevoVideo: VideoPractica = {
      id: Date.now().toString(),
      usuarioId: video.usuarioId || '',
      titulo: video.titulo || 'Sin título',
      url: video.url || '',
      fechaSubida: new Date(),
      estado: 'pendiente'
    };
    this.videosMock.push(nuevoVideo);
    return of(nuevoVideo).pipe(delay(800));
  }

  // Progreso (simplificado)
  getProgresoUsuario(usuarioId: string): Observable<number> {
    const evaluaciones = this.evaluacionesMock.filter(e => e.usuarioId === usuarioId);
    if (evaluaciones.length === 0) return of(0);
    const media = evaluaciones.reduce((sum, e) => sum + e.puntuacionTotal, 0) / evaluaciones.length;
    const maxPosible = 15; // según la rúbrica de ejemplo
    return of(Math.round((media / maxPosible) * 100)).pipe(delay(300));
  }
}