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

  private subscriptions: Subscription[] = [];

  constructor(
    private evaluacionService: EvaluacionService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPendientes();
    this.cargarExamenesTeoricos();
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
    // Se obtienen todos los exámenes activos (podrías filtrar por usuario no realizados)
    this.evaluacionService.getExamenesTeoricos().subscribe({
      next: (examenes: ExamenTeorico[]) => {
        // Filtrar solo activos (si el backend no lo hace)
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
    this.router.navigate(['/evaluacion/evaluar', item.id]);
  }

  tomarExamen(examen: ExamenTeorico): void {
    // Redirige a un componente que maneje la realización del examen teórico
    this.router.navigate(['/evaluacion/examen-teorico', examen.id]);
  }
}