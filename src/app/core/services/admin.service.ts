import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EstadisticaAdmin { usuariosTotales: number; usuariosActivosMes: number; contenidosPublicados: number; evaluacionesRealizadas: number; documentosSubidos: number; eventosProximos: number; }
export interface ActividadReciente { id: string; tipo: string; accion: string; usuario: string; fecha: Date; detalles?: string; }

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEstadisticas(): Observable<EstadisticaAdmin> {
    return this.http.get<EstadisticaAdmin>(`${this.apiUrl}/admin/estadisticas`);
  }

  getActividadReciente(limit: number = 10): Observable<ActividadReciente[]> {
    return this.http.get<ActividadReciente[]>(`${this.apiUrl}/admin/actividad?limit=${limit}`);
  }

  toggleUsuarioBloqueado(usuarioId: string, bloquear: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/usuarios/${usuarioId}/bloquear`, { bloquear });
  }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/usuarios`);
  }
}