import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { ComunidadService } from '../../../core/services/comunidad.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

// Interfaces (asumimos que están definidas en comunidad.service)
import { Foro, Hilo, Mensaje } from '../../../core/services/comunidad.service';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './foro.component.html',
  styleUrls: ['./foro.component.scss']
})
export class ForoComponent implements OnInit, OnDestroy {
  foros: Foro[] = [];
  foroSeleccionado: Foro | null = null;

  hilos: Hilo[] = [];
  cargandoHilos = false;

  // Modal nuevo hilo
  modalNuevoHiloVisible = false;
  nuevoHilo = { titulo: '', contenido: '' };

  // Detalle de hilo y respuestas
  hiloSeleccionado: Hilo | null = null;
  respuestas: Mensaje[] = [];
  nuevaRespuesta = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private comunidadService: ComunidadService,
    private notificacionService: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarForos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarForos(): void {
    this.comunidadService.getForos().subscribe({
      next: (foros) => {
        this.foros = foros;
        if (foros.length > 0) {
          this.seleccionarForo(foros[0]);
        }
      },
      error: (err) => {
        console.error('Error cargando foros', err);
        this.notificacionService.mostrarError('No se pudieron cargar las categorías');
      }
    });
  }

  seleccionarForo(foro: Foro): void {
    this.foroSeleccionado = foro;
    this.cargarHilos(foro.id);
  }

  cargarHilos(foroId: string): void {
    this.cargandoHilos = true;
    this.comunidadService.getHilos(foroId).subscribe({
      next: (hilos) => {
        this.hilos = hilos;
        this.cargandoHilos = false;
      },
      error: (err) => {
        console.error('Error cargando hilos', err);
        this.notificacionService.mostrarError('No se pudieron cargar los hilos');
        this.cargandoHilos = false;
      }
    });
  }

  // Modal nuevo hilo
  abrirModalNuevoHilo(): void {
    if (!this.foroSeleccionado) return;
    this.nuevoHilo = { titulo: '', contenido: '' };
    this.modalNuevoHiloVisible = true;
  }

  cerrarModalNuevoHilo(): void {
    this.modalNuevoHiloVisible = false;
  }

  guardarNuevoHilo(): void {
    if (!this.foroSeleccionado || !this.nuevoHilo.titulo.trim() || !this.nuevoHilo.contenido.trim()) {
      this.notificacionService.mostrarAdvertencia('Completa todos los campos');
      return;
    }

    // Obtener usuario actual
    let autor = 'Usuario';
    this.authService.getUser().subscribe(user => {
      autor = user?.nombre || user?.displayName || 'Usuario';
    });

    const nuevoHilo: Partial<Hilo> = {
      foroId: this.foroSeleccionado!.id,
      titulo: this.nuevoHilo.titulo,
      contenido: this.nuevoHilo.contenido,
      autor: autor
    };

    this.comunidadService.crearHilo(nuevoHilo).subscribe({
      next: (hiloCreado) => {
        this.hilos.unshift(hiloCreado); // Añadir al principio
        this.notificacionService.mostrarExito('Hilo creado correctamente');
        this.cerrarModalNuevoHilo();
      },
      error: (err) => {
        console.error('Error creando hilo', err);
        this.notificacionService.mostrarError('No se pudo crear el hilo');
      }
    });
  }

  // Ver detalle de hilo
  verHilo(hilo: Hilo): void {
    this.hiloSeleccionado = hilo;
    this.nuevaRespuesta = '';
    this.cargarRespuestas(hilo.id);
  }

  cargarRespuestas(hiloId: string): void {
    this.comunidadService.getMensajes(hiloId).subscribe({
      next: (mensajes) => {
        this.respuestas = mensajes;
      },
      error: (err) => {
        console.error('Error cargando respuestas', err);
        this.notificacionService.mostrarError('No se pudieron cargar las respuestas');
      }
    });
  }

  cerrarDetalleHilo(): void {
    this.hiloSeleccionado = null;
    this.respuestas = [];
  }

  enviarRespuesta(): void {
    if (!this.hiloSeleccionado || !this.nuevaRespuesta.trim()) return;

    let autor = 'Usuario';
    this.authService.getUser().subscribe(user => {
      autor = user?.nombre || user?.displayName || 'Usuario';
    });

    const nuevoMensaje: Partial<Mensaje> = {
      hiloId: this.hiloSeleccionado!.id,
      contenido: this.nuevaRespuesta,
      autor: autor
    };

    this.comunidadService.enviarMensaje(nuevoMensaje).subscribe({
      next: (mensaje) => {
        this.respuestas.push(mensaje);
        // Actualizar contador de respuestas en el hilo seleccionado
        if (this.hiloSeleccionado) {
          this.hiloSeleccionado.respuestas++;
          this.hiloSeleccionado.ultimaRespuesta = new Date();
        }
        // Actualizar también en la lista de hilos
        const hiloEnLista = this.hilos.find(h => h.id === this.hiloSeleccionado!.id);
        if (hiloEnLista) {
          hiloEnLista.respuestas++;
          hiloEnLista.ultimaRespuesta = new Date();
        }
        this.nuevaRespuesta = '';
        this.notificacionService.mostrarExito('Respuesta enviada');
      },
      error: (err) => {
        console.error('Error enviando respuesta', err);
        this.notificacionService.mostrarError('No se pudo enviar la respuesta');
      }
    });
  }
}