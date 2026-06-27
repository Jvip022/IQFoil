import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

import { EvaluacionService, ExamenTeorico, Pregunta } from '../../../core/services/evaluacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';

@Component({
  selector: 'app-examen-teorico',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EstadoConexionComponent],
  templateUrl: './examen-teorico.component.html',
  styleUrls: ['./examen-teorico.component.scss']
})
export class ExamenTeoricoComponent implements OnInit, OnDestroy {
  examen: ExamenTeorico | null = null;
  preguntas: Pregunta[] = [];
  respuestas: { [preguntaId: number]: string | boolean | null } = {};
  cargando = true;
  enviado = false;
  tiempoRestante = 0; // en segundos
  tiempoTotal = 0;
  private timerSubscription?: Subscription;
  private examenId = 0;

  // Índice de pregunta actual (para paginación)
  preguntaActual = 0;
  totalPreguntas = 0;

  // Resultado final
  puntajeObtenido = 0;
  aprobado = false;

  // Hacer router público para usarlo en el template
  public router: Router;

  constructor(
    private route: ActivatedRoute,
    router: Router,
    private evaluacionService: EvaluacionService,
    private notificacionService: NotificacionService
  ) {
    this.router = router;
  }

  ngOnInit(): void {
    this.examenId = +this.route.snapshot.paramMap.get('id')!;
    if (!this.examenId) {
      this.notificacionService.mostrarError('ID de examen no válido');
      this.router.navigate(['/evaluacion/realizar']);
      return;
    }
    this.cargarExamen();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private cargarExamen(): void {
    this.cargando = true;
    this.evaluacionService.getExamenTeorico(this.examenId).subscribe({
      next: (data: ExamenTeorico) => {
        this.examen = data;
        this.preguntas = data.preguntas || [];
        this.totalPreguntas = this.preguntas.length;
        this.tiempoTotal = (data.tiempoLimiteMinutos || 0) * 60;
        this.tiempoRestante = this.tiempoTotal;
        this.cargando = false;
        this.iniciarTemporizador();
        // Inicializar respuestas (usamos null para indicar no respondida)
        this.preguntas.forEach(p => {
          this.respuestas[p.id] = null;
        });
      },
      error: (err) => {
        console.error('Error al cargar examen:', err);
        this.notificacionService.mostrarError('Error al cargar el examen');
        this.cargando = false;
        this.router.navigate(['/evaluacion/realizar']);
      }
    });
  }

  private iniciarTemporizador(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.tiempoRestante > 0 && !this.enviado) {
        this.tiempoRestante--;
        if (this.tiempoRestante === 0) {
          this.enviarExamenAutomaticamente();
        }
      }
    });
  }

  get tiempoFormateado(): string {
    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  get progreso(): number {
    if (this.totalPreguntas === 0) return 0;
    const respondidas = this.preguntas.filter(p => {
      const resp = this.respuestas[p.id];
      return resp !== null && resp !== undefined && resp !== '';
    }).length;
    return Math.round((respondidas / this.totalPreguntas) * 100);
  }

  // Navegación entre preguntas
  irAPregunta(index: number): void {
    if (index >= 0 && index < this.totalPreguntas) {
      this.preguntaActual = index;
    }
  }

  siguientePregunta(): void {
    if (this.preguntaActual < this.totalPreguntas - 1) {
      this.preguntaActual++;
    }
  }

  anteriorPregunta(): void {
    if (this.preguntaActual > 0) {
      this.preguntaActual--;
    }
  }

  // Envío del examen
  enviarExamen(): void {
    if (this.enviado) return;
    // Validar que todas las preguntas tengan respuesta
    const todasRespondidas = this.preguntas.every(p => {
      const resp = this.respuestas[p.id];
      return resp !== null && resp !== undefined && resp !== '';
    });
    if (!todasRespondidas) {
      this.notificacionService.mostrarAdvertencia('Por favor, responde todas las preguntas antes de enviar.');
      return;
    }
    this.confirmarEnvio();
  }

  private confirmarEnvio(): void {
    if (confirm('¿Estás seguro de que deseas enviar el examen? No podrás modificarlo después.')) {
      this.enviarExamenAlServidor();
    }
  }

  private enviarExamenAutomaticamente(): void {
    if (this.enviado) return;
    this.notificacionService.mostrarAdvertencia('⏰ Tiempo agotado. El examen se enviará automáticamente.');
    this.enviarExamenAlServidor();
  }

  private enviarExamenAlServidor(): void {
    this.enviado = true;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    // Construir payload con las respuestas (limpiar nulls)
    const respuestasLimpias: { [preguntaId: number]: string | boolean } = {};
    for (const [key, value] of Object.entries(this.respuestas)) {
      if (value !== null && value !== undefined && value !== '') {
        respuestasLimpias[+key] = value;
      }
    }

    const payload = {
      examenId: this.examenId,
      respuestas: respuestasLimpias
    };

    this.evaluacionService.enviarExamenTeorico(this.examenId, payload).subscribe({
      next: (resultado: any) => {
        this.puntajeObtenido = resultado.puntaje || 0;
        this.aprobado = resultado.aprobado || false;
        this.notificacionService.mostrarExito('Examen enviado correctamente');
        // No redirigimos, mostramos el resultado en el mismo componente
      },
      error: (err) => {
        console.error('Error al enviar examen:', err);
        this.notificacionService.mostrarError('Error al enviar el examen. Inténtalo de nuevo.');
        this.enviado = false;
      }
    });
  }

  // Método para volver a la lista de evaluaciones
  volver(): void {
    this.router.navigate(['/evaluacion/realizar']);
  }
}