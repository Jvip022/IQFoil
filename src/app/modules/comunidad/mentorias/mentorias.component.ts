import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';

export interface Mentor {
  id: string;
  nombre: string;
  area: string;
  experiencia: number;
  avatar?: string;
  disponible: boolean;
}

export interface Mentoria {
  id: string;
  mentorId: string;
  mentorNombre: string;
  mentorAvatar?: string;
  area: string;
  estado: 'pendiente' | 'activa' | 'completada' | 'cancelada';
  fechaInicio: Date;
  fechaFin?: Date;
  mensajeSolicitud?: string;
}

@Component({
  selector: 'app-mentorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './mentorias.component.html',
  styleUrls: ['./mentorias.component.scss']
})
export class MentoriasComponent implements OnInit {
  tabActivo: 'disponibles' | 'mis-mentorias' = 'disponibles';
  cargando = false;

  // Datos
  mentores: Mentor[] = [];
  mentoresFiltrados: Mentor[] = [];
  misMentorias: Mentoria[] = [];

  // Filtros
  searchTerm = '';

  // Modal solicitud
  modalSolicitudVisible = false;
  mentorSeleccionado: Mentor | null = null;
  mensajeSolicitud = '';

  // Modal feedback
  modalFeedbackVisible = false;
  mentoriaFeedback: Mentoria | null = null;
  feedbackPuntuacion = '5';
  feedbackComentario = '';

  constructor(
    private notificacionService: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    setTimeout(() => {
      this.mentores = [
        {
          id: 'm1',
          nombre: 'Carlos Sainz',
          area: 'Técnica de foils',
          experiencia: 12,
          avatar: '',
          disponible: true
        },
        {
          id: 'm2',
          nombre: 'Laura Martínez',
          area: 'Reglamento y estrategia',
          experiencia: 8,
          avatar: '',
          disponible: true
        },
        {
          id: 'm3',
          nombre: 'Javier Ruiz',
          area: 'Preparación física',
          experiencia: 10,
          avatar: '',
          disponible: true
        }
      ];
      this.mentoresFiltrados = [...this.mentores];

      this.misMentorias = [
        {
          id: 'men1',
          mentorId: 'm1',
          mentorNombre: 'Carlos Sainz',
          area: 'Técnica de foils',
          estado: 'activa',
          fechaInicio: new Date(Date.now() - 3 * 24 * 3600000)
        },
        {
          id: 'men2',
          mentorId: 'm2',
          mentorNombre: 'Laura Martínez',
          area: 'Reglamento',
          estado: 'pendiente',
          fechaInicio: new Date(Date.now() + 2 * 24 * 3600000),
          mensajeSolicitud: 'Quiero prepararme para el examen de reglas'
        },
        {
          id: 'men3',
          mentorId: 'm3',
          mentorNombre: 'Javier Ruiz',
          area: 'Preparación física',
          estado: 'completada',
          fechaInicio: new Date(Date.now() - 10 * 24 * 3600000),
          fechaFin: new Date(Date.now() - 3 * 24 * 3600000)
        }
      ];
      this.cargando = false;
    }, 600);
  }

  cambiarTab(tab: 'disponibles' | 'mis-mentorias'): void {
    this.tabActivo = tab;
  }

  filtrarMentores(): void {
    const term = this.searchTerm.toLowerCase();
    this.mentoresFiltrados = this.mentores.filter(m =>
      m.nombre.toLowerCase().includes(term) || m.area.toLowerCase().includes(term)
    );
  }

  abrirModalSolicitar(): void {
    this.tabActivo = 'disponibles';
  }

  solicitarMentoria(mentor: Mentor): void {
    this.mentorSeleccionado = mentor;
    this.mensajeSolicitud = '';
    this.modalSolicitudVisible = true;
  }

  confirmarSolicitud(): void {
    if (!this.mentorSeleccionado) return;

    // Crear nueva mentoría (simulada)
    const nuevaMentoria: Mentoria = {
      id: 'men' + Date.now(),
      mentorId: this.mentorSeleccionado.id,
      mentorNombre: this.mentorSeleccionado.nombre,
      area: this.mentorSeleccionado.area,
      estado: 'pendiente',
      fechaInicio: new Date(),
      mensajeSolicitud: this.mensajeSolicitud
    };
    this.misMentorias.unshift(nuevaMentoria);
    this.notificacionService.mostrarExito('Solicitud enviada correctamente');
    this.cancelarSolicitud();
    this.tabActivo = 'mis-mentorias';
  }

  cancelarSolicitud(): void {
    this.modalSolicitudVisible = false;
    this.mentorSeleccionado = null;
    this.mensajeSolicitud = '';
  }

  verPerfil(mentor: Mentor): void {
    this.notificacionService.mostrarInfo('Ver perfil (en desarrollo)');
  }

  iniciarChat(mentoria: Mentoria): void {
    this.notificacionService.mostrarInfo('Chat con ' + mentoria.mentorNombre);
  }

  finalizarMentoria(mentoria: Mentoria): void {
    mentoria.estado = 'completada';
    mentoria.fechaFin = new Date();
    this.notificacionService.mostrarExito('Mentoria finalizada');
  }

  darFeedback(mentoria: Mentoria): void {
    this.mentoriaFeedback = mentoria;
    this.feedbackPuntuacion = '5';
    this.feedbackComentario = '';
    this.modalFeedbackVisible = true;
  }

  cancelarFeedback(): void {
    this.modalFeedbackVisible = false;
    this.mentoriaFeedback = null;
  }

  enviarFeedback(): void {
    if (this.mentoriaFeedback) {
      this.notificacionService.mostrarExito('Feedback enviado. ¡Gracias!');
    }
    this.cancelarFeedback();
  }
}