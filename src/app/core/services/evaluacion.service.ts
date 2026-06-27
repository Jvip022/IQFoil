import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ==================== EVALUACIÓN PRÁCTICA (existente) ====================
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

// ==================== EVALUACIÓN TEÓRICA (nuevo) ====================
export type TipoPregunta = 'opcion_unica' | 'opcion_multiple' | 'verdadero_falso' | 'texto_corto';

export interface Pregunta {
  id: number;             // Cambiado a number para coincidir con el componente
  texto: string;
  tipo: TipoPregunta;
  opciones?: string[];
  respuestaCorrecta?: string | string[] | boolean; // Añadido boolean para verdadero/falso
  puntaje?: number;
  explicacion?: string;
  nivel?: string;
  categoria?: string;
}

export interface ExamenTeorico {
  id: number;             // Cambiado a number
  titulo: string;
  descripcion?: string;
  nivel: string;
  preguntas: Pregunta[];
  tiempoLimiteMinutos: number;
  puntajeAprobacion: number;
  fechaCreacion: Date;
  activo: boolean;
}

export interface RespuestaUsuario {
  id?: string;
  examenId: number;
  usuarioId: string;
  respuestas: { preguntaId: number; respuesta: string | string[] | boolean }[];
  fechaInicio: Date;
  fechaEnvio?: Date;
  puntajeObtenido?: number;
  porcentaje?: number;
  aprobado?: boolean;
  estado: 'en_curso' | 'finalizado';
}

@Injectable({ providedIn: 'root' })
export class EvaluacionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== RÚBRICAS (práctica) ====================
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

  // ==================== EVALUACIONES PRÁCTICAS ====================
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

  // ==================== EVALUACIÓN TEÓRICA ====================
  // Preguntas
  getPreguntas(filtros?: { nivel?: string; categoria?: string }): Observable<Pregunta[]> {
    let url = `${this.apiUrl}/evaluaciones/teoricas/preguntas`;
    if (filtros) {
      const params = new URLSearchParams();
      if (filtros.nivel) params.set('nivel', filtros.nivel);
      if (filtros.categoria) params.set('categoria', filtros.categoria);
      if (params.toString()) url += `?${params.toString()}`;
    }
    return this.http.get<Pregunta[]>(url);
  }

  getPregunta(id: number): Observable<Pregunta> {
    return this.http.get<Pregunta>(`${this.apiUrl}/evaluaciones/teoricas/preguntas/${id}`);
  }

  crearPregunta(pregunta: Omit<Pregunta, 'id'>): Observable<Pregunta> {
    return this.http.post<Pregunta>(`${this.apiUrl}/evaluaciones/teoricas/preguntas`, pregunta);
  }

  actualizarPregunta(id: number, pregunta: Partial<Pregunta>): Observable<Pregunta> {
    return this.http.put<Pregunta>(`${this.apiUrl}/evaluaciones/teoricas/preguntas/${id}`, pregunta);
  }

  eliminarPregunta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/evaluaciones/teoricas/preguntas/${id}`);
  }

  // Exámenes teóricos
  getExamenesTeoricos(): Observable<ExamenTeorico[]> {
    return this.http.get<ExamenTeorico[]>(`${this.apiUrl}/evaluaciones/teoricas/examenes`);
  }

  getExamenTeorico(id: number): Observable<ExamenTeorico> {
    return this.http.get<ExamenTeorico>(`${this.apiUrl}/evaluaciones/teoricas/examenes/${id}`);
  }

  crearExamenTeorico(examen: Omit<ExamenTeorico, 'id'>): Observable<ExamenTeorico> {
    return this.http.post<ExamenTeorico>(`${this.apiUrl}/evaluaciones/teoricas/examenes`, examen);
  }

  actualizarExamenTeorico(id: number, examen: Partial<ExamenTeorico>): Observable<ExamenTeorico> {
    return this.http.put<ExamenTeorico>(`${this.apiUrl}/evaluaciones/teoricas/examenes/${id}`, examen);
  }

  eliminarExamenTeorico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/evaluaciones/teoricas/examenes/${id}`);
  }

  // Enviar examen teórico (método específico para el componente)
  enviarExamenTeorico(examenId: number, respuestas: any): Observable<{ puntaje: number; aprobado: boolean }> {
    return this.http.post<{ puntaje: number; aprobado: boolean }>(
      `${this.apiUrl}/evaluaciones/teoricas/examenes/${examenId}/enviar`,
      { respuestas }
    );
  }

  // Respuestas de usuarios
  iniciarExamenTeorico(examenId: number): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(`${this.apiUrl}/evaluaciones/teoricas/iniciar`, { examenId });
  }

  guardarRespuestas(respuesta: Partial<RespuestaUsuario>): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(`${this.apiUrl}/evaluaciones/teoricas/guardar`, respuesta);
  }

  finalizarExamenTeorico(respuestaId: string): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(`${this.apiUrl}/evaluaciones/teoricas/finalizar/${respuestaId}`, {});
  }

  getResultadosTeoricos(usuarioId?: string): Observable<RespuestaUsuario[]> {
    const url = usuarioId ? `${this.apiUrl}/evaluaciones/teoricas/resultados?usuarioId=${usuarioId}` : `${this.apiUrl}/evaluaciones/teoricas/resultados`;
    return this.http.get<RespuestaUsuario[]>(url);
  }

  getResultadoTeorico(id: string): Observable<RespuestaUsuario> {
    return this.http.get<RespuestaUsuario>(`${this.apiUrl}/evaluaciones/teoricas/resultados/${id}`);
  }
}