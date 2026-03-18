import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Video {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  duracion: number; // segundos
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  progreso?: number; // 0-100
  completado: boolean;
}

export interface Modulo {
  id: string;
  titulo: string;
  videos: Video[];
  completado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContenidoService {
  private modulosMock: Modulo[] = [
    {
      id: '1',
      titulo: 'Introducción a la vela',
      videos: [
        {
          id: '101',
          titulo: 'Partes del barco',
          descripcion: 'Conoce los elementos básicos',
          url: 'https://example.com/video1',
          duracion: 360,
          nivel: 'principiante',
          progreso: 100,
          completado: true
        },
        {
          id: '102',
          titulo: 'Nudos fundamentales',
          descripcion: 'Aprende los nudos esenciales',
          url: 'https://example.com/video2',
          duracion: 480,
          nivel: 'principiante',
          progreso: 50,
          completado: false
        }
      ],
      completado: false
    },
    {
      id: '2',
      titulo: 'Maniobras básicas',
      videos: [
        {
          id: '201',
          titulo: 'Virada',
          descripcion: 'Cómo virar correctamente',
          url: 'https://example.com/video3',
          duracion: 600,
          nivel: 'intermedio',
          progreso: 0,
          completado: false
        }
      ],
      completado: false
    }
  ];

  constructor() {}

  /** Obtiene todos los módulos */
  getModulos(): Observable<Modulo[]> {
    return of(this.modulosMock).pipe(delay(600));
  }

  /** Obtiene un módulo por id */
  getModulo(id: string): Observable<Modulo | undefined> {
    const modulo = this.modulosMock.find(m => m.id === id);
    return of(modulo).pipe(delay(300));
  }

  /** Obtiene los videos recomendados */
  getRecomendados(limit: number = 5): Observable<Video[]> {
    const todosLosVideos = this.modulosMock.flatMap(m => m.videos);
    // Simplemente devolvemos los primeros
    return of(todosLosVideos.slice(0, limit)).pipe(delay(400));
  }

  /** Marca un video como visto y actualiza progreso */
  marcarVideoComoVisto(moduloId: string, videoId: string): Observable<boolean> {
    const modulo = this.modulosMock.find(m => m.id === moduloId);
    if (modulo) {
      const video = modulo.videos.find(v => v.id === videoId);
      if (video) {
        video.progreso = 100;
        video.completado = true;
      }
      // Comprobar si el módulo está completo
      modulo.completado = modulo.videos.every(v => v.completado);
    }
    return of(true).pipe(delay(200));
  }

  /** Actualiza el progreso de un video */
  actualizarProgreso(moduloId: string, videoId: string, progreso: number): Observable<boolean> {
    const modulo = this.modulosMock.find(m => m.id === moduloId);
    if (modulo) {
      const video = modulo.videos.find(v => v.id === videoId);
      if (video) {
        video.progreso = progreso;
        if (progreso >= 100) {
          video.completado = true;
        }
      }
    }
    return of(true).pipe(delay(200));
  }

  /** Obtiene el progreso global del usuario (porcentaje de videos completados) */
  getProgresoGlobal(): Observable<number> {
    const todosLosVideos = this.modulosMock.flatMap(m => m.videos);
    const completados = todosLosVideos.filter(v => v.completado).length;
    const total = todosLosVideos.length;
    const porcentaje = total > 0 ? (completados / total) * 100 : 0;
    return of(porcentaje).pipe(delay(300));
  }
}