import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';




// ========== Interfaz para notificaciones persistentes (listas) ==========
export interface NotificacionPersistente {
  id: string;
  tipo: 'info' | 'exito' | 'alerta' | 'error';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
  link?: string;
}

// ========== Interfaz para notificaciones tipo toast (emergentes) ==========
export interface NotificacionToast {
  tipo: 'exito' | 'error' | 'advertencia' | 'info';
  mensaje: string;
  duracion?: number; // en milisegundos
}

@Injectable({ providedIn: 'root' })

  export class NotificacionService {
  private apiUrl = environment.apiUrl;

  getNotificaciones(): Observable<NotificacionPersistente[]> {
    return this.http.get<NotificacionPersistente[]>(`${this.apiUrl}/notificaciones`);
  }


  // ========== Notificaciones persistentes (mock) ==========
  private notificacionesMock: NotificacionPersistente[] = [
    {
      id: '1',
      tipo: 'info',
      titulo: 'Bienvenido',
      mensaje: 'Gracias por usar la plataforma',
      leida: false,
      fecha: new Date()
    },
    {
      id: '2',
      tipo: 'exito',
      titulo: 'Curso completado',
      mensaje: 'Has finalizado el módulo de introducción',
      leida: false,
      fecha: new Date(Date.now() - 86400000)
    }
  ];

  // ========== Sistema de notificaciones toast ==========
  private toastSubject = new Subject<NotificacionToast>();
  toast$ = this.toastSubject.asObservable();

  constructor(private http: HttpClient) { }

  // ========== Métodos para notificaciones persistentes ==========

  getUnreadCount(): Observable<number> {
    const count = this.notificacionesMock.filter(n => !n.leida).length;
    return of(count).pipe(delay(200));
  }

  marcarComoLeida(id: string): Observable<boolean> {
    const notif = this.notificacionesMock.find(n => n.id === id);
    if (notif) {
      notif.leida = true;
    }
    return of(true).pipe(delay(200));
  }

  marcarTodasLeidas(): Observable<boolean> {
    this.notificacionesMock.forEach(n => n.leida = true);
    return of(true).pipe(delay(300));
  }

  eliminarNotificacion(id: string): Observable<boolean> {
    this.notificacionesMock = this.notificacionesMock.filter(n => n.id !== id);
    return of(true).pipe(delay(200));
  }

  fetchLatest(limit: number = 5): Observable<NotificacionPersistente[]> {
    return of(this.notificacionesMock.slice(0, limit)).pipe(delay(300));
  }

  // ========== Métodos para notificaciones toast ==========
  mostrarExito(mensaje: string, duracion: number = 3000): void {
    this.toastSubject.next({ tipo: 'exito', mensaje, duracion });
  }

  mostrarError(mensaje: string, duracion: number = 5000): void {
    this.toastSubject.next({ tipo: 'error', mensaje, duracion });
  }

  mostrarAdvertencia(mensaje: string, duracion: number = 4000): void {
    this.toastSubject.next({ tipo: 'advertencia', mensaje, duracion });
  }

  mostrarInfo(mensaje: string, duracion: number = 3000): void {
    this.toastSubject.next({ tipo: 'info', mensaje, duracion });
  }

}


