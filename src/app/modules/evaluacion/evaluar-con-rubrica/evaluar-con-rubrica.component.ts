import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { EvaluacionService, Rubrica, Evaluacion } from '../../../core/services/evaluacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

// Interfaz extendida para incluir campos adicionales que vienen del backend
interface EvaluacionDetalle extends Evaluacion {
  usuarioNombre?: string;
  fechaEntrega: Date;
  videoUrl?: string;
}

@Component({
  selector: 'app-evaluar-con-rubrica',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadoConexionComponent, LoadingSpinnerComponent],
  templateUrl: './evaluar-con-rubrica.component.html',
  styleUrls: ['./evaluar-con-rubrica.component.scss']
})
export class EvaluarConRubricaComponent implements OnInit, OnDestroy {
  evaluacionId!: string;

  cargando = false;
  guardando = false;

  evaluacion: EvaluacionDetalle | null = null;
  rubrica: Rubrica | null = null;

  puntuaciones: { [criterioId: string]: number } = {};
  puntuacionTotal = 0;
  puntuacionMaxima = 0;
  comentarios = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluacionService: EvaluacionService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.evaluacionId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.evaluacionId) {
      this.notificacionService.mostrarError('ID de evaluación no válido');
      this.router.navigate(['/evaluacion/lista']);
      return;
    }
    this.cargarDatos(this.evaluacionId);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Getter para saber si es solo lectura
  get esSoloLectura(): boolean {
    return this.evaluacion?.estado === 'evaluado';
  }

  
  cargarDatos(evaluacionId: string): void {
    this.cargando = true;
    this.evaluacionService.getEvaluacionById(evaluacionId).subscribe({
      next: (evaluacion: Evaluacion | undefined) => {
        if (!evaluacion) {
          this.notificacionService.mostrarError('Evaluación no encontrada');
          this.cargando = false;
          this.router.navigate(['/evaluacion/lista']);
          return;
        }

        // Obtener videoUrl desde cualquier propiedad que pueda tener el objeto
        const videoUrl = (evaluacion as any).video_url || (evaluacion as any).videoUrl || '';

        this.evaluacion = {
          ...evaluacion,
          usuarioNombre: 'Usuario ' + evaluacion.usuarioId,
          fechaEntrega: evaluacion.fecha || new Date(),
          videoUrl: videoUrl
        };
        this.comentarios = evaluacion.comentarios || '';

        this.evaluacionService.getRubrica(evaluacion.rubricaId).subscribe({
          next: (rubrica: Rubrica | undefined) => {
            if (!rubrica) {
              this.notificacionService.mostrarError('Rúbrica no encontrada');
              this.cargando = false;
              return;
            }
            this.rubrica = rubrica;
            this.puntuacionMaxima = rubrica.criterios.reduce((sum, c) => sum + c.puntuacionMaxima, 0);

            // Inicializar puntuaciones desde datos guardados o a cero
            if (evaluacion.puntuaciones && evaluacion.puntuaciones.length > 0) {
              evaluacion.puntuaciones.forEach(p => {
                this.puntuaciones[p.criterioId] = p.puntuacion;
              });
            } else {
              rubrica.criterios.forEach(c => {
                this.puntuaciones[c.id] = 0;
              });
            }
            this.calcularTotal();
            this.cargando = false;
          },
          error: (err: any) => {
            console.error('Error cargando rúbrica', err);
            this.notificacionService.mostrarError('No se pudo cargar la rúbrica');
            this.cargando = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Error cargando evaluación', err);
        this.notificacionService.mostrarError('No se pudo cargar la evaluación');
        this.cargando = false;
      }
    });
  }

  calcularTotal(): void {
    this.puntuacionTotal = Object.values(this.puntuaciones).reduce((sum, val) => sum + (val || 0), 0);
  }

  guardarEvaluacion(): void {
    // Prevenir guardado si ya está evaluado
    if (this.esSoloLectura) {
      this.notificacionService.mostrarAdvertencia('Esta evaluación ya fue realizada y no se puede modificar');
      return;
    }

    if (!this.evaluacion || !this.rubrica) {
      this.notificacionService.mostrarError('Faltan datos de evaluación');
      return;
    }

    // Validar que todas las puntuaciones estén asignadas
    const todosCriterios = this.rubrica.criterios.every(c => 
      this.puntuaciones[c.id] !== undefined && this.puntuaciones[c.id] !== null
    );
    if (!todosCriterios) {
      this.notificacionService.mostrarAdvertencia('Por favor, asigna una puntuación a todos los criterios');
      return;
    }

    this.guardando = true;
    const puntuacionesArray = Object.entries(this.puntuaciones).map(([criterioId, puntuacion]) => ({
      criterioId,
      puntuacion: Number(puntuacion)
    }));

    this.evaluacionService.guardarEvaluacion(this.evaluacionId, {
      puntuaciones: puntuacionesArray,
      comentarios: this.comentarios,
      puntuacionTotal: this.puntuacionTotal
    }).subscribe({
      next: () => {
        this.notificacionService.mostrarExito('Evaluación guardada correctamente');
        this.guardando = false;
        this.router.navigate(['/evaluacion/lista']);
      },
      error: (err: any) => {
        console.error('Error guardando evaluación', err);
        this.notificacionService.mostrarError('No se pudo guardar la evaluación');
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/evaluacion/lista']);
  }

  // Método para verificar si todas las puntuaciones han sido asignadas
  todasPuntuacionesAsignadas(): boolean {
    if (!this.rubrica) return false;
    return this.rubrica.criterios.every(c => 
      this.puntuaciones[c.id] !== undefined && this.puntuaciones[c.id] !== null
    );
  }

  // Método opcional para trackBy (mejora rendimiento en listas largas)
  trackByCriterio(index: number, criterio: any): string {
    return criterio.id;
  }
}