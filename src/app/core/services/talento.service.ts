import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Insignia { id: string; nombre: string; descripcion: string; icono: string; fechaObtenida?: Date; categoria?: string; color?: string; requisitos?: string; }
export interface AlertaTalento { id: string; tipo: string; mensaje: string; usuario: string; fecha: Date; leida: boolean; }
export interface Recomendacion { id: string; tipo: string; titulo: string; descripcion: string; razon: string; url?: string; fecha?: Date; meta?: any; }

@Injectable({ providedIn: 'root' })
export class TalentoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getInsignias(): Observable<Insignia[]> {
    return this.http.get<Insignia[]>(`${this.apiUrl}/talentos/insignias`);
  }

  getAlertasNoLeidas(): Observable<AlertaTalento[]> {
    return this.http.get<AlertaTalento[]>(`${this.apiUrl}/talentos/alertas`);
  }

  marcarAlertaComoLeida(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/talentos/alertas/${id}`, { leida: true });
  }

  getRecomendaciones(usuarioId: string): Observable<Recomendacion[]> {
    return this.http.get<Recomendacion[]>(`${this.apiUrl}/talentos/recomendaciones`);
  }


  getUserBadges(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talentos/insignias/usuario/${usuarioId}`);
  }

  getMentorFor(usuarioId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/talentos/mentor/${usuarioId}`);
  }

  getAtletasForCoach(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talentos/atletas/${usuarioId}`);
  }

  getPendingEvaluationsForCoach(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talentos/evaluaciones-pendientes/${usuarioId}`);
  }
}