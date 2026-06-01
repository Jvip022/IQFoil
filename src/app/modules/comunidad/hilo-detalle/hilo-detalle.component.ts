import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

// Servicios
import { ComunidadService } from '../../../core/services/comunidad.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

// Interfaces
import { Hilo, Mensaje } from '../../../core/services/comunidad.service';

@Component({
  selector: 'app-hilo-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    EstadoConexionComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './hilo-detalle.component.html',
  styleUrls: ['./hilo-detalle.component.scss']
})
export class HiloDetalleComponent implements OnInit, OnDestroy {
  hiloId: string | null = null;
  hilo: Hilo | null = null;
  respuestas: Mensaje[] = [];
  cargando = false;
  enviando = false;
  nuevaRespuesta = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private comunidadService: ComunidadService,
    private notificacionService: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.hiloId = params.get('id');
      if (this.hiloId) {
        this.cargarHilo(this.hiloId);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarHilo(id: string): void {
    this.cargando = true;
    this.comunidadService.getHilo(id).subscribe({
      next: (hilo: Hilo | undefined) => {  // ✅ tipo explícito
        if (hilo) {
          this.hilo = hilo;
          this.cargarRespuestas(id);
        } else {
          this.notificacionService.mostrarError('Hilo no encontrado');
          this.cargando = false;
        }
      },
      error: (err: any) => {  // ✅ tipo explícito
        console.error('Error cargando hilo', err);
        this.notificacionService.mostrarError('No se pudo cargar el hilo');
        this.cargando = false;
      }
    });
  }

  cargarRespuestas(hiloId: string): void {
    this.comunidadService.getMensajes(hiloId).subscribe({
      next: (mensajes: Mensaje[]) => {
        this.respuestas = mensajes;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error cargando respuestas', err);
        this.notificacionService.mostrarError('No se pudieron cargar las respuestas');
        this.cargando = false;
      }
    });
  }

  enviarRespuesta(): void {
    if (!this.hilo || !this.nuevaRespuesta.trim()) return;

    this.enviando = true;

    this.authService.getUser().subscribe(user => {
      const autor = user?.nombre || user?.displayName || 'Usuario';

      const nuevoMensaje: Partial<Mensaje> = {
        hiloId: this.hilo!.id,
        contenido: this.nuevaRespuesta,
        autor: autor
      };

      this.comunidadService.enviarMensaje(nuevoMensaje).subscribe({
        next: (mensaje: Mensaje) => {
          this.respuestas.push(mensaje);
          if (this.hilo) {
            this.hilo.respuestas = (this.hilo.respuestas || 0) + 1;
            this.hilo.ultimaRespuesta = new Date();
          }
          this.nuevaRespuesta = '';
          this.enviando = false;
          this.notificacionService.mostrarExito('Respuesta enviada');
        },
        error: (err: any) => {
          console.error('Error enviando respuesta', err);
          this.notificacionService.mostrarError('No se pudo enviar la respuesta');
          this.enviando = false;
        }
      });
    });
  }
}