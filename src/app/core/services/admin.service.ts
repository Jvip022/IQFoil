import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface EstadisticaAdmin {
  usuariosTotales: number;
  usuariosActivosMes: number;
  contenidosPublicados: number;
  evaluacionesRealizadas: number;
  documentosSubidos: number;
  eventosProximos: number;
}

export interface ActividadReciente {
  id: string;
  tipo: 'usuario' | 'contenido' | 'evaluacion' | 'documento';
  accion: string;
  usuario: string;
  fecha: Date;
  detalles?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private estadisticasMock: EstadisticaAdmin = {
    usuariosTotales: 1250,
    usuariosActivosMes: 847,
    contenidosPublicados: 342,
    evaluacionesRealizadas: 5678,
    documentosSubidos: 189,
    eventosProximos: 12
  };

  private actividadRecienteMock: ActividadReciente[] = [
    { id: '1', tipo: 'usuario', accion: 'Nuevo registro', usuario: 'Carlos López', fecha: new Date() },
    { id: '2', tipo: 'contenido', accion: 'Video subido', usuario: 'Ana García', fecha: new Date(Date.now() - 3600000) },
    { id: '3', tipo: 'evaluacion', accion: 'Evaluación completada', usuario: 'María Torres', fecha: new Date(Date.now() - 7200000) },
    { id: '4', tipo: 'documento', accion: 'Documento actualizado', usuario: 'Juan Pérez', fecha: new Date(Date.now() - 86400000) }
  ];

  constructor() {}

  /** Obtiene estadísticas generales del dashboard de administración */
  getEstadisticas(): Observable<EstadisticaAdmin> {
    return of(this.estadisticasMock).pipe(delay(500));
  }

  /** Obtiene la lista de actividad reciente */
  getActividadReciente(limit: number = 10): Observable<ActividadReciente[]> {
    return of(this.actividadRecienteMock.slice(0, limit)).pipe(delay(400));
  }

  /** Bloquea o desbloquea un usuario (simulado) */
  toggleUsuarioBloqueado(usuarioId: string, bloquear: boolean): Observable<boolean> {
    console.log(`Usuario ${usuarioId} ${bloquear ? 'bloqueado' : 'desbloqueado'}`);
    return of(true).pipe(delay(300));
  }

  /** Obtiene la lista de usuarios (simplificada) */
  getUsuarios(): Observable<any[]> {
    return of([]).pipe(delay(600));
  }
}