import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  fechaObtenida?: Date;
}

export interface AlertaTalento {
  id: string;
  tipo: 'nuevo-talento' | 'logro-destacado' | 'recomendacion';
  mensaje: string;
  usuario: string;
  fecha: Date;
  leida: boolean;
}

export interface Recomendacion {
  id: string;
  tipo: 'curso' | 'mentoria' | 'evento';
  titulo: string;
  descripcion: string;
  razon: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TalentoService {
  private insigniasMock: Insignia[] = [
    { id: '1', nombre: 'Principiante', descripcion: 'Primer video completado', icono: '🌱' },
    { id: '2', nombre: 'Navegante', descripcion: '10 horas de navegación', icono: '⛵' },
    { id: '3', nombre: 'Estratega', descripcion: 'Participación en 5 regatas', icono: '🏆' }
  ];

  private alertasMock: AlertaTalento[] = [
    { id: '1', tipo: 'nuevo-talento', mensaje: 'María Pérez ha completado el nivel avanzado', usuario: 'María', fecha: new Date(), leida: false },
    { id: '2', tipo: 'logro-destacado', mensaje: 'Juan ha obtenido la insignia Estratega', usuario: 'Juan', fecha: new Date(Date.now() - 86400000), leida: true }
  ];

  private recomendacionesMock: Recomendacion[] = [
    { id: '1', tipo: 'curso', titulo: 'Técnicas de foils', descripcion: 'Perfecciona tus habilidades', razon: 'Basado en tu progreso reciente' },
    { id: '2', tipo: 'mentoria', titulo: 'Sesión con Carlos Sainz', descripcion: 'Aprende de un experto', razon: 'Tu nivel es intermedio' }
  ];

  constructor() {}

  // Insignias
  getInsignias(usuarioId?: string): Observable<Insignia[]> {
    return of(this.insigniasMock).pipe(delay(400));
  }

  otorgarInsignia(usuarioId: string, insigniaId: string): Observable<boolean> {
    const insignia = this.insigniasMock.find(i => i.id === insigniaId);
    if (insignia) {
      insignia.fechaObtenida = new Date();
    }
    return of(true).pipe(delay(300));
  }

  // Alertas
  getAlertasNoLeidas(): Observable<AlertaTalento[]> {
    return of(this.alertasMock.filter(a => !a.leida)).pipe(delay(300));
  }

  marcarAlertaComoLeida(id: string): Observable<boolean> {
    const alerta = this.alertasMock.find(a => a.id === id);
    if (alerta) alerta.leida = true;
    return of(true).pipe(delay(200));
  }

  // Recomendaciones
  getRecomendaciones(usuarioId: string): Observable<Recomendacion[]> {
    return of(this.recomendacionesMock).pipe(delay(500));
  }

  // Detección de talentos (simulado)
  detectarTalentos(): Observable<any[]> {
    return of([]).pipe(delay(600));
  }
}
export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  fechaObtenida?: Date;
  categoria?: string;
  color?: string;
  requisitos?: string;
}

export interface Recomendacion {
  id: string;
  tipo: 'curso' | 'mentoria' | 'evento';
  titulo: string;
  descripcion: string;
  razon: string;
  url?: string;
  fecha?: Date;          // para eventos
  meta?: {                // metadatos adicionales
    duracion?: string;
    nivel?: string;
    [key: string]: any;
  };
}