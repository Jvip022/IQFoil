import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ProgresoIndividual {
  usuario_id: number;
  nombre: string;
  progreso_global: number;
  videos_vistos: number;
  total_videos: number;
  evaluaciones_realizadas: number;
  nota_promedio: number;
  insignias: { id: number; nombre: string; fecha: string }[];
  evolucion: { mes: string; videos_completados: number; puntuacion_promedio: number }[];
}

export interface Talento {
  usuario_id: number;
  nombre: string;
  progreso: number;
  insignias: number;
  nota_promedio: number;
  score: number;
}

export interface UsoPlataforma {
  usuarios_totales: number;
  usuarios_activos_mes: number;
  total_videos: number;
  reproducciones_totales: number;
  documentos_subidos: number;
  evaluaciones_realizadas: number;
  uso_mensual: { mes: string; actividades: number }[];
}

export interface DocumentoDesactualizado {
  id: number;
  titulo: string;
  tipo: string;
  fecha_subida: string;
  dias_antiguo: number;
  autor: string;
}

export interface RendimientoAtleta {
  fechas: string[];
  puntuaciones: number[];
  peso: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProgresoIndividual(usuarioId: number): Observable<ProgresoIndividual> {
    return this.http.get<ProgresoIndividual>(`${this.apiUrl}/reportes/progreso-individual/${usuarioId}`);
  }

  getComparativoProvincial(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/comparativo-provincial`);
  }

  getTalentos(): Observable<Talento[]> {
    return this.http.get<Talento[]>(`${this.apiUrl}/reportes/talentos`);
  }

  getUsoPlataforma(): Observable<UsoPlataforma> {
    return this.http.get<UsoPlataforma>(`${this.apiUrl}/reportes/uso-plataforma`);
  }

  getDocumentosDesactualizados(): Observable<DocumentoDesactualizado[]> {
    return this.http.get<DocumentoDesactualizado[]>(`${this.apiUrl}/reportes/documentos-desactualizados`);
  }

  getRendimientoAtleta(usuarioId: number): Observable<RendimientoAtleta> {
    return this.http.get<RendimientoAtleta>(`${this.apiUrl}/reportes/rendimiento/${usuarioId}`)
      .pipe(
        catchError(error => {
          console.warn('Error al obtener rendimiento, usando datos mock:', error);
          // Datos mock para que la UI no se rompa si el backend falla
          return of({
            fechas: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            puntuaciones: [65, 72, 78, 83, 80, 88],
            peso: 72.5
          });
        })
      );
  }
}