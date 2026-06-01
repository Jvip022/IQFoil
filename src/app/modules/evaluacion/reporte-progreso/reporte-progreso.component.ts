import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';
import { ContenidoService } from '../../../core/services/contenido.service';
import { EvaluacionService } from '../../../core/services/evaluacion.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

export interface ProgresoData {
  modulosCompletados: number;
  totalModulos: number;
  videosVistos: number;
  totalVideos: number;
  evaluacionesRealizadas: number;
  puntuacionMedia: number;
  modulos: { nombre: string; progreso: number; color: string }[];
  evolucion: { mes: string; puntuacion: number }[];
  actividadReciente: { icono: string; descripcion: string; fecha: Date }[];
}

@Component({
  selector: 'app-reporte-progreso',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './reporte-progreso.component.html',
  styleUrls: ['./reporte-progreso.component.scss']
})
export class ReporteProgresoComponent implements OnInit, OnDestroy {
  cargando = false;
  exportando = false;

  progreso: ProgresoData = {
    modulosCompletados: 0,
    totalModulos: 0,
    videosVistos: 0,
    totalVideos: 0,
    evaluacionesRealizadas: 0,
    puntuacionMedia: 0,
    modulos: [],
    evolucion: [],
    actividadReciente: []
  };

  coloresEvolucion = ['#4aa3c2', '#1a2b4c', '#f39c12', '#61708b', '#d94e4e'];

  private subscriptions: Subscription[] = [];

  constructor(
    private notificacionService: NotificacionService,
    private contenidoService: ContenidoService,
    private evaluacionService: EvaluacionService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarDatos(): void {
    this.cargando = true;
    // Simular carga desde servicios
    setTimeout(() => {
      this.progreso = {
        modulosCompletados: 3,
        totalModulos: 5,
        videosVistos: 12,
        totalVideos: 18,
        evaluacionesRealizadas: 7,
        puntuacionMedia: 82,
        modulos: [
          { nombre: 'Introducción', progreso: 100, color: '#4aa3c2' },
          { nombre: 'Técnica básica', progreso: 80, color: '#1a2b4c' },
          { nombre: 'Maniobras', progreso: 60, color: '#f39c12' },
          { nombre: 'Reglamento', progreso: 40, color: '#61708b' },
          { nombre: 'Avanzado', progreso: 20, color: '#d94e4e' }
        ],
        evolucion: [
          { mes: 'Ene', puntuacion: 65 },
          { mes: 'Feb', puntuacion: 70 },
          { mes: 'Mar', puntuacion: 78 },
          { mes: 'Abr', puntuacion: 82 },
          { mes: 'May', puntuacion: 80 },
          { mes: 'Jun', puntuacion: 85 }
        ],
        actividadReciente: [
          { icono: '📝', descripcion: 'Evaluación de "Técnica básica" completada', fecha: new Date(Date.now() - 2 * 24 * 3600000) },
          { icono: '🎥', descripcion: 'Video "Virada" visto', fecha: new Date(Date.now() - 3 * 24 * 3600000) },
          { icono: '🏆', descripcion: 'Insignia "Principiante" obtenida', fecha: new Date(Date.now() - 5 * 24 * 3600000) },
          { icono: '📚', descripcion: 'Módulo "Introducción" completado', fecha: new Date(Date.now() - 7 * 24 * 3600000) }
        ]
      };
      this.cargando = false;
    }, 800);
  } 

  exportarReporte(): void {
    this.exportando = true;
    // Simular exportación a PDF o CSV
    setTimeout(() => {
      this.notificacionService.mostrarExito('Reporte exportado correctamente');
      this.exportando = false;
    }, 1000);
  }
}