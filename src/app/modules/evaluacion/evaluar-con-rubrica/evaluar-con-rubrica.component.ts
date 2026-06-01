import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { EvaluacionService, Rubrica, Evaluacion } from '../../../core/services/evaluacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

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
  @Input() evaluacionId!: string;

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
    private evaluacionService: EvaluacionService,
    private notificacionService: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.evaluacionId) {
      this.cargarDatos(this.evaluacionId);
    } else {
      this.notificacionService.mostrarError('No se especificó la evaluación a cargar');
      this.router.navigate(['/evaluacion/lista-evaluaciones']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarDatos(evaluacionId: string): void {
    this.cargando = true;
    this.evaluacionService.getEvaluacionById(evaluacionId).subscribe({
      next: (evaluacion: Evaluacion | undefined) => {
        if (!evaluacion) {
          this.notificacionService.mostrarError('Evaluación no encontrada');
          this.cargando = false;
          return;
        }
        this.evaluacion = {
          ...evaluacion,
          usuarioNombre: 'Usuario ' + evaluacion.usuarioId,
          fechaEntrega: evaluacion.fecha
        };
        this.evaluacionService.getRubrica(evaluacion.rubricaId).subscribe({
          next: (rubrica: Rubrica | undefined) => {
            if (!rubrica) {
              this.notificacionService.mostrarError('Rúbrica no encontrada');
              this.cargando = false;
              return;
            }
            this.rubrica = rubrica;
            this.puntuacionMaxima = rubrica.criterios.reduce((sum, c) => sum + c.puntuacionMaxima, 0);

            if (evaluacion.puntuaciones) {
              evaluacion.puntuaciones.forEach(p => {
                this.puntuaciones[p.criterioId] = p.puntuacion;
              });
            } else {
              rubrica.criterios.forEach(c => {
                this.puntuaciones[c.id] = 0;
              });
            }
            this.calcularTotal();
            this.comentarios = evaluacion.comentarios || '';
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
    this.puntuacionTotal = Object.values(this.puntuaciones).reduce((sum, val) => sum + val, 0);
  }

  guardarEvaluacion(): void {
    if (!this.evaluacion || !this.rubrica) return;

    this.guardando = true;
    const puntuacionesArray = Object.entries(this.puntuaciones).map(([criterioId, puntuacion]) => ({
      criterioId,
      puntuacion
    }));

    this.evaluacionService.guardarEvaluacion(this.evaluacionId, {
      puntuaciones: puntuacionesArray,
      comentarios: this.comentarios,
      puntuacionTotal: this.puntuacionTotal
    }).subscribe({
      next: () => {
        this.notificacionService.mostrarExito('Evaluación guardada correctamente');
        this.guardando = false;
        this.router.navigate(['/evaluacion/lista-evaluaciones']);
      },
      error: (err: any) => {
        console.error('Error guardando evaluación', err);
        this.notificacionService.mostrarError('No se pudo guardar la evaluación');
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/evaluacion/lista-evaluaciones']);
  }
}