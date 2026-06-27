import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take, first } from 'rxjs/operators';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

// Servicios
import { ContenidoService } from '../../../core/services/contenido.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: Date;
  lugar: string;
  tipo: string;
  organizador?: string;
  contacto?: string;
}

@Component({
  selector: 'app-calendario-eventos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './calendario-eventos.component.html',
  styleUrls: ['./calendario-eventos.component.scss']
})
export class CalendarioEventosComponent implements OnInit {
  cargando = false;
  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];

  searchTerm = '';
  filtroTipo = '';
  filtroMes = '';

  eventoSeleccionado: Evento | null = null;

  constructor(
    private contenidoService: ContenidoService,
    private authService: AuthService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.authService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        if (user && user.uid) {
          this.obtenerEventos(user.uid);
        } else {
          this.authService.getUser().pipe(take(1)).subscribe({
            next: (userAsync) => {
              if (userAsync && userAsync.uid) {
                this.obtenerEventos(userAsync.uid);
              } else {
                this.notificacionService.mostrarError('Usuario no autenticado');
                this.cargando = false;
              }
            },
            error: () => {
              this.notificacionService.mostrarError('No se pudo obtener el usuario');
              this.cargando = false;
            }
          });
        }
      },
      error: () => {
        this.notificacionService.mostrarError('Error al obtener el usuario');
        this.cargando = false;
      }
    });
  }

  private obtenerEventos(usuarioId: string): void {
    this.cargando = true;
    this.contenidoService.getUpcomingEventsForUser(usuarioId).subscribe({
      next: (data: any[]) => {
        this.eventos = data.map(item => ({
          id: String(item.id),
          titulo: item.titulo,
          descripcion: item.descripcion || '',
          fecha: new Date(item.fecha),
          lugar: item.lugar || 'Por definir',
          tipo: item.tipo || 'evento',
          organizador: item.organizador || '',
          contacto: item.contacto || ''
        }));
        this.filtrarEventos();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando eventos:', err);
        this.notificacionService.mostrarError('No se pudieron cargar los eventos');
        this.cargando = false;
      }
    });
  }

  filtrarEventos(): void {
    let filtrados = this.eventos;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(e =>
        e.titulo.toLowerCase().includes(term) ||
        (e.descripcion && e.descripcion.toLowerCase().includes(term))
      );
    }

    if (this.filtroTipo) {
      filtrados = filtrados.filter(e => e.tipo === this.filtroTipo);
    }

    if (this.filtroMes !== '') {
      const mes = parseInt(this.filtroMes, 10);
      filtrados = filtrados.filter(e => e.fecha.getMonth() === mes);
    }

    filtrados.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    this.eventosFiltrados = filtrados;
  }

  verEvento(evento: Evento): void {
    this.eventoSeleccionado = evento;
  }

  cerrarDetalle(): void {
    this.eventoSeleccionado = null;
  }

  inscribirse(evento: Evento): void {
    // Obtener el usuario actual desde el observable
    this.authService.currentUser$.pipe(first()).subscribe({
      next: (user) => {
        if (!user || !user.uid) {
          this.notificacionService.mostrarError('Debes iniciar sesión para inscribirte');
          return;
        }

        this.contenidoService.inscribirseEvento(evento.id).subscribe({
          next: () => {
            this.notificacionService.mostrarExito(`Te has inscrito en "${evento.titulo}"`);
            this.cerrarDetalle();
          },
          error: (err) => {
            const mensaje = err.error?.error || 'No se pudo completar la inscripción';
            this.notificacionService.mostrarError(mensaje);
            console.error('Error al inscribirse:', err);
          }
        });
      },
      error: () => {
        this.notificacionService.mostrarError('Error al obtener el usuario');
      }
    });
  }
}