import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  tipo: 'curso' | 'mentoria' | 'evento' | string;
  titulo: string;
  descripcion: string;
  razon: string;
  url?: string;
  fecha?: Date;
  meta?: { duracion?: string; nivel?: string; [key: string]: any };
}

export interface MetricasTalento {
  progresoGeneral: number;
  insigniasObtenidas: number;
  totalInsignias: number;
  horasNavegacion: number;
  trendHoras: number;
  evaluacionesRealizadas: number;
  evaluacionesPendientes: number;
  alertasActivas: number;
  puntuacionMedia: number;
  progresoCategoria: { nombre: string; valor: number; color: string }[];
  evolucionMensual: { mes: string; valor: number }[];
  ultimasActividades: { icono: string; descripcion: string; fecha: Date }[];
}

@Injectable({ providedIn: 'root' })
export class TalentoService {
  private apiUrl = environment.apiUrl;

  // ============================================================
  // DATOS MOCK
  // ============================================================
  private mockInsignias: Insignia[] = [
    {
      id: 'ins-1',
      nombre: 'Principiante',
      descripcion: 'Primer video completado',
      icono: '🌱',
      categoria: 'logro',
      color: '#4aa3c2',
      requisitos: 'Completar al menos 1 video tutorial',
      fechaObtenida: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
    },
    {
      id: 'ins-2',
      nombre: 'Navegante',
      descripcion: '10 horas de navegación',
      icono: '⛵',
      categoria: 'logro',
      color: '#1a2b4c',
      requisitos: 'Acumular 10 horas de navegación registradas'
    },
    {
      id: 'ins-3',
      nombre: 'Estratega',
      descripcion: 'Participación en 5 regatas',
      icono: '🏆',
      categoria: 'competencia',
      color: '#f39c12',
      requisitos: 'Participar en al menos 5 regatas oficiales',
      fechaObtenida: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      id: 'ins-4',
      nombre: 'Experto en Foil',
      descripcion: 'Dominio avanzado de la técnica de foil',
      icono: '🚀',
      categoria: 'técnica',
      color: '#e67e22',
      requisitos: 'Completar el módulo avanzado de foil y obtener 90% de puntaje'
    }
  ];

  private mockAlertas: AlertaTalento[] = [
    {
      id: 'mock-1',
      tipo: 'nuevo-talento',
      mensaje: 'Juan Pérez ha completado 5 videos y muestra un progreso excepcional.',
      usuario: 'Juan Pérez',
      fecha: new Date(Date.now() - 1000 * 60 * 30), // hace 30 min
      leida: false
    },
    {
      id: 'mock-2',
      tipo: 'logro-destacado',
      mensaje: 'María García ha obtenido la insignia "Navegante Experto" por completar 10 horas de navegación.',
      usuario: 'María García',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 2), // hace 2 h
      leida: false
    },
    {
      id: 'mock-3',
      tipo: 'recomendacion',
      mensaje: 'Se recomienda a Luis Fernández para el programa de alto rendimiento.',
      usuario: 'Luis Fernández',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 24), // hace 1 día
      leida: true
    },
    {
      id: 'mock-4',
      tipo: 'logro-destacado',
      mensaje: 'Ana Torres ha logrado la insignia "Estratega" tras participar en 5 regatas.',
      usuario: 'Ana Torres',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 3), // hace 3 h
      leida: false
    }
  ];

  private mockRecomendaciones: Recomendacion[] = [
    {
      id: 'rec-1',
      tipo: 'curso',
      titulo: 'Técnica Avanzada de Foil',
      descripcion: 'Aprende a dominar el foil en condiciones extremas con técnicas de última generación.',
      razon: 'Has completado el nivel intermedio y muestras un progreso del 85% en técnica.',
      meta: { duracion: '6 módulos', nivel: 'Avanzado' }
    },
    {
      id: 'rec-2',
      tipo: 'mentoria',
      titulo: 'Mentoría con Carlos Sainz',
      descripcion: 'Recibe asesoramiento personalizado de un experto en regatas de alto rendimiento.',
      razon: 'Has participado en 3 regatas y tu puntuación ha mejorado un 20% en el último mes.',
      meta: { duracion: '4 sesiones', nivel: 'Todos los niveles' }
    }
  ];

  private mockMetricas: MetricasTalento = {
    progresoGeneral: 68,
    insigniasObtenidas: 7,
    totalInsignias: 10,
    horasNavegacion: 245,
    trendHoras: 12,
    evaluacionesRealizadas: 18,
    evaluacionesPendientes: 3,
    alertasActivas: 2,
    puntuacionMedia: 8.4,
    progresoCategoria: [
      { nombre: 'Técnica', valor: 75, color: '#4aa3c2' },
      { nombre: 'Reglamento', valor: 60, color: '#1a2b4c' },
      { nombre: 'Seguridad', valor: 90, color: '#f39c12' },
      { nombre: 'Física', valor: 45, color: '#61708b' },
      { nombre: 'Estrategia', valor: 70, color: '#d94e4e' }
    ],
    evolucionMensual: [
      { mes: 'Ene', valor: 45 },
      { mes: 'Feb', valor: 52 },
      { mes: 'Mar', valor: 58 },
      { mes: 'Abr', valor: 63 },
      { mes: 'May', valor: 70 },
      { mes: 'Jun', valor: 68 }
    ],
    ultimasActividades: [
      { icono: '🏆', descripcion: 'Insignia "Estratega" obtenida', fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { icono: '📝', descripcion: 'Evaluación de técnica completada', fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    ]
  };

  constructor(private http: HttpClient) { }

  // ============================================================
  // ALERTAS
  // ============================================================
  getAlertasNoLeidas(): Observable<AlertaTalento[]> {
    return this.http.get<AlertaTalento[]>(`${this.apiUrl}/talentos/alertas`)
      .pipe(
        catchError(error => {
          console.warn('Error al obtener alertas del backend. Usando datos mock.', error);
          return of(this.mockAlertas);
        })
      );
  }

  marcarAlertaComoLeida(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/talentos/alertas/${id}`, { leida: true })
      .pipe(
        catchError(error => {
          console.warn('Error al marcar alerta como leída. Simulando éxito.', error);
          return of({ success: true, id });
        })
      );
  }

  // ============================================================
  // INSIGNIAS
  // ============================================================
  getInsignias(): Observable<Insignia[]> {
    return this.http.get<Insignia[]>(`${this.apiUrl}/talentos/insignias`)
      .pipe(catchError(() => of(this.mockInsignias)));
  }

  otorgarInsignia(usuarioId: string, insigniaId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/talentos/insignias/otorgar`, { usuarioId, insigniaId })
      .pipe(catchError(() => of({ success: true })));
  }

  // ============================================================
  // RECOMENDACIONES
  // ============================================================
  getRecomendaciones(usuarioId: string): Observable<Recomendacion[]> {
    return this.http.get<Recomendacion[]>(`${this.apiUrl}/talentos/recomendaciones?usuarioId=${usuarioId}`)
      .pipe(catchError(() => of(this.mockRecomendaciones)));
  }

  // ============================================================
  // MÉTRICAS
  // ============================================================
  getMetricas(periodo: string = 'mes'): Observable<MetricasTalento> {
    return this.http.get<MetricasTalento>(`${this.apiUrl}/talentos/metricas?periodo=${periodo}`)
      .pipe(catchError(() => of(this.mockMetricas)));
  }

  // ============================================================
  // OTROS
  // ============================================================
  getUserBadges(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talentos/insignias/usuario/${usuarioId}`)
      .pipe(catchError(() => of([])));
  }

  getMentorFor(usuarioId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/talentos/mentor/${usuarioId}`)
      .pipe(catchError(() => of(null)));
  }

  getAtletasForCoach(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talentos/atletas/${usuarioId}`)
      .pipe(catchError(() => of([])));
  }

  getPendingEvaluationsForCoach(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talentos/evaluaciones-pendientes/${usuarioId}`)
      .pipe(catchError(() => of([])));
  }
}