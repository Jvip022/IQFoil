import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class ComunidadService {
  private forosMock: Foro[] = [
    { id: '1', titulo: 'Reglamento', descripcion: 'Dudas sobre las reglas de competición', totalHilos: 23, ultimaActividad: new Date() },
    { id: '2', titulo: 'Técnica', descripcion: 'Consejos y preguntas sobre técnica', totalHilos: 45, ultimaActividad: new Date(Date.now() - 3600000) },
    { id: '3', titulo: 'Material', descripcion: 'Equipamiento y embarcaciones', totalHilos: 17, ultimaActividad: new Date(Date.now() - 7200000) }
  ];

  private hilosMock: Hilo[] = [
    { id: '101', foroId: '1', titulo: '¿Cómo se penaliza un fuera de línea?', autor: 'Juan', fechaCreacion: new Date(Date.now() - 86400000), ultimaRespuesta: new Date(), respuestas: 5, vistas: 120 },
    { id: '102', foroId: '2', titulo: 'Mejorar la virada', autor: 'Ana', fechaCreacion: new Date(Date.now() - 172800000), ultimaRespuesta: new Date(Date.now() - 3600000), respuestas: 8, vistas: 210 }
  ];

  private mensajesMock: Mensaje[] = [
    { id: '1001', hiloId: '101', autor: 'Carlos', contenido: 'Depende de la situación...', fecha: new Date(Date.now() - 86400000) },
    { id: '1002', hiloId: '101', autor: 'María', contenido: 'Según la regla 42...', fecha: new Date(Date.now() - 43200000) }
  ];

  private mentoriasMock: Mentoria[] = [
    { id: '1', mentor: 'Pedro Gómez', aprendiz: 'Luis Fernández', area: 'Técnica de foils', estado: 'activa', fechaInicio: new Date(Date.now() - 604800000) }
  ];

  constructor() {}

  // Foros
  getForos(): Observable<Foro[]> {
    return of(this.forosMock).pipe(delay(400));
  }

  getForo(id: string): Observable<Foro | undefined> {
    return of(this.forosMock.find(f => f.id === id)).pipe(delay(200));
  }

  // Hilos
  getHilos(foroId?: string): Observable<Hilo[]> {
    if (foroId) {
      return of(this.hilosMock.filter(h => h.foroId === foroId)).pipe(delay(500));
    }
    return of(this.hilosMock).pipe(delay(500));
  }

  getHilo(id: string): Observable<Hilo | undefined> {
    return of(this.hilosMock.find(h => h.id === id)).pipe(delay(200));
  }

  crearHilo(hilo: Partial<Hilo>): Observable<Hilo> {
    const nuevoHilo: Hilo = {
      id: Date.now().toString(),
      foroId: hilo.foroId || '1',
      titulo: hilo.titulo || 'Nuevo hilo',
      autor: hilo.autor || 'Usuario actual',
      fechaCreacion: new Date(),
      ultimaRespuesta: new Date(),
      respuestas: 0,
      vistas: 0
    };
    this.hilosMock.push(nuevoHilo);
    return of(nuevoHilo).pipe(delay(600));
  }

  // Mensajes
  getMensajes(hiloId: string): Observable<Mensaje[]> {
    return of(this.mensajesMock.filter(m => m.hiloId === hiloId)).pipe(delay(300));
  }

  enviarMensaje(mensaje: Partial<Mensaje>): Observable<Mensaje> {
    const nuevoMensaje: Mensaje = {
      id: Date.now().toString(),
      hiloId: mensaje.hiloId || '',
      autor: mensaje.autor || 'Usuario',
      contenido: mensaje.contenido || '',
      fecha: new Date()
    };
    this.mensajesMock.push(nuevoMensaje);

    // Actualizar el hilo (última respuesta)
    const hilo = this.hilosMock.find(h => h.id === mensaje.hiloId);
    if (hilo) {
      hilo.ultimaRespuesta = new Date();
      hilo.respuestas++;
    }
    return of(nuevoMensaje).pipe(delay(400));
  }

  // Mentorías
  getMentorias(usuarioId?: string): Observable<Mentoria[]> {
    // Si se proporciona usuario, filtrar por mentor o aprendiz
    return of(this.mentoriasMock).pipe(delay(500));
  }

  solicitarMentoria(mentoria: Partial<Mentoria>): Observable<Mentoria> {
    const nueva: Mentoria = {
      id: Date.now().toString(),
      mentor: mentoria.mentor || '',
      aprendiz: mentoria.aprendiz || '',
      area: mentoria.area || 'General',
      estado: 'pendiente'
    };
    this.mentoriasMock.push(nueva);
    return of(nueva).pipe(delay(600));
  }
}