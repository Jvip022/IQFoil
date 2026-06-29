import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { EvaluacionService, VideoPractica, ExamenTeorico } from '../../../core/services/evaluacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-realizar-evaluacion',
  standalone: true,
  imports: [CommonModule, EstadoConexionComponent, LoadingSpinnerComponent],
  templateUrl: './realizar-evaluacion.component.html',
  styleUrls: ['./realizar-evaluacion.component.scss']
})
export class RealizarEvaluacionComponent implements OnInit, OnDestroy {
  tabActivo: 'practicas' | 'teoricos' = 'practicas';
  cargandoPracticas = false;
  cargandoTeoricos = false;
  pendientes: VideoPractica[] = [];
  examenesTeoricos: ExamenTeorico[] = [];

  esAdminOEntrenador = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private evaluacionService: EvaluacionService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe(user => {
      this.esAdminOEntrenador = user?.roles?.includes('admin') || user?.roles?.includes('entrenador') || false;
      // Si es atleta, mostrar directamente la pestaña de exámenes
      if (!this.esAdminOEntrenador) {
        this.tabActivo = 'teoricos';
        // Cargar exámenes teóricos si no se han cargado
        if (this.examenesTeoricos.length === 0) {
          this.cargarExamenesTeoricos();
        }
      } else {
        // Para admin/entrenador, cargar prácticas y exámenes
        this.cargarPendientes();
        this.cargarExamenesTeoricos();
      }
    });

    // Si por alguna razón el usuario es atleta pero la pestaña está en prácticas, forzar
    if (!this.esAdminOEntrenador && this.tabActivo === 'practicas') {
      this.tabActivo = 'teoricos';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarPendientes(): void {
    this.cargandoPracticas = true;
    this.evaluacionService.getVideosPendientes().subscribe({
      next: (videos: VideoPractica[]) => {
        this.pendientes = videos;
        this.cargandoPracticas = false;
      },
      error: (err: any) => {
        console.error('Error cargando prácticas pendientes', err);
        this.notificacionService.mostrarError('No se pudieron cargar las prácticas pendientes');
        this.cargandoPracticas = false;
      }
    });
  }

  cargarExamenesTeoricos(): void {
    this.cargandoTeoricos = true;
    this.evaluacionService.getExamenesTeoricos().subscribe({
      next: (examenes: ExamenTeorico[]) => {
        this.examenesTeoricos = examenes.filter(e => e.activo === true);
        this.cargandoTeoricos = false;
      },
      error: (err: any) => {
        console.error('Error cargando exámenes teóricos', err);
        this.notificacionService.mostrarError('No se pudieron cargar los exámenes teóricos');
        this.cargandoTeoricos = false;
      }
    });
  }

  evaluarPractica(item: VideoPractica): void {
    console.log('Navegando a evaluación de práctica:', item.id);
    this.router.navigate(['/evaluacion/evaluar', item.id])
      .then(success => {
        if (!success) {
          this.notificacionService.mostrarError('No se pudo acceder a la evaluación (ruta no encontrada)');
        }
      })
      .catch(err => {
        console.error('Error en navegación:', err);
        this.notificacionService.mostrarError('Error al navegar a la evaluación');
      });
  }

  tomarExamen(examen: ExamenTeorico): void {
    console.log('Navegando a examen teórico:', examen.id);
    this.router.navigate(['/evaluacion/examen-teorico', examen.id])
      .then(success => {
        if (!success) {
          this.notificacionService.mostrarError('No se pudo acceder al examen (ruta no encontrada)');
        }
      })
      .catch(err => {
        console.error('Error en navegación:', err);
        this.notificacionService.mostrarError('Error al navegar al examen');
      });
  }
}