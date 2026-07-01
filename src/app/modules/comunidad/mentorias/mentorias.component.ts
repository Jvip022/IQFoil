import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { ComunidadService, Mentoria as MentoriaService } from '../../../core/services/comunidad.service';
import { AdminService } from '../../../core/services/admin.service';

export interface Mentor {
  id: string;
  nombre: string;
  area: string;
  experiencia: number;
  avatar?: string;
  disponible: boolean;
}

export interface MentoriaUI extends MentoriaService {
  mentorNombre: string;
  mentorAvatar?: string;
  aprendizId: string;
  aprendizNombre?: string;
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

  currentUser: User | null = null;
  esAtleta = false;
  esEntrenador = false;
  esAdmin = false;

  mentores: Mentor[] = [];
  mentoresFiltrados: Mentor[] = [];
  misMentorias: MentoriaUI[] = [];

  searchTerm = '';

  modalSolicitudVisible = false;
  mentorSeleccionado: Mentor | null = null;
  mensajeSolicitud = '';

  modalFeedbackVisible = false;
  mentoriaFeedback: MentoriaUI | null = null;
  feedbackPuntuacion = '5';
  feedbackComentario = '';

  constructor(
    private authService: AuthService,
    private comunidadService: ComunidadService,
    private adminService: AdminService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.esAtleta = user.roles?.includes('atleta') ?? false;
        this.esEntrenador = user.roles?.includes('entrenador') ?? false;
        this.esAdmin = user.roles?.includes('admin') ?? false;
        console.log('🔍 Usuario:', user);
        console.log('🔍 esAtleta:', this.esAtleta, 'esAdmin:', this.esAdmin);
        this.cargarDatos();
      } else {
        console.warn('⚠️ Usuario no autenticado');
      }
    });
  }

  cargarDatos(): void {
    this.cargando = true;

    // ====================================================================
    // 1. Cargar mentores (entrenadores) - disponible para todos los roles
    // ====================================================================
    this.adminService.getUsuarios().subscribe({
      next: (usuarios) => {
        console.log('✅ Usuarios recibidos del backend:', usuarios);
        // Filtrar por rol_id=2 (entrenador) o por roles
        const entrenadores = usuarios.filter(
          (u: any) => u.rol_id === 2 || u.roles?.includes('entrenador')
        );
        this.mentores = entrenadores.map((u: any) => ({
          id: u.id.toString(),
          nombre: u.nombre,
          area: u.area || 'General',
          experiencia: u.experiencia || 0,
          avatar: u.avatar,
          disponible: true
        }));
        this.mentoresFiltrados = [...this.mentores];
        this.cargando = false;
        console.log('✅ Mentores cargados:', this.mentores);
      },
      error: (err) => {
        console.error('❌ Error al cargar mentores desde API:', err);
        this.notificacionService.mostrarAdvertencia(
          'No se pudieron cargar los mentores. Mostrando datos de prueba.'
        );
        // Fallback a datos mock
        this.mentores = [
          { id: 'm1', nombre: 'Carlos Sainz', area: 'Técnica de foils', experiencia: 12, avatar: '', disponible: true },
          { id: 'm2', nombre: 'Laura Martínez', area: 'Reglamento y estrategia', experiencia: 8, avatar: '', disponible: true },
          { id: 'm3', nombre: 'Javier Ruiz', area: 'Preparación física', experiencia: 10, avatar: '', disponible: true }
        ];
        this.mentoresFiltrados = [...this.mentores];
        this.cargando = false;
      }
    });

    // ====================================================================
    // 2. Cargar mentorías del usuario (si tiene UID)
    // ====================================================================
    if (this.currentUser?.uid) {
      this.comunidadService.getMentorias(this.currentUser.uid).subscribe({
        next: (data) => {
          console.log('✅ Mentorías recibidas:', data);
          this.misMentorias = data.map((m: any) => {
            const mentor = this.mentores.find((ment: Mentor) => ment.id === m.mentor);
            return {
              ...m,
              mentorNombre: mentor ? mentor.nombre : 'Mentor',
              mentorAvatar: mentor ? mentor.avatar : '',
              aprendizId: m.aprendiz,
              aprendizNombre: 'Aprendiz', // Se puede mejorar con un lookup
              fechaFin: undefined,
              mensajeSolicitud: undefined
            };
          });
          this.cargando = false;
        },
        error: (err) => {
          console.error('❌ Error al cargar mentorías:', err);
          // Fallback a datos mock con el usuario actual
          const uid = this.currentUser?.uid || '3';
          const nombre = this.currentUser?.nombre || 'Tú';
          this.misMentorias = [
            {
              id: 'men1',
              mentor: 'm1',
              mentorNombre: 'Carlos Sainz',
              aprendiz: uid,
              aprendizId: uid,
              aprendizNombre: nombre,
              area: 'Técnica de foils',
              estado: 'activa',
              fechaInicio: new Date(Date.now() - 3 * 24 * 3600000),
              fechaFin: undefined
            },
            {
              id: 'men2',
              mentor: 'm2',
              mentorNombre: 'Laura Martínez',
              aprendiz: uid,
              aprendizId: uid,
              aprendizNombre: nombre,
              area: 'Reglamento',
              estado: 'pendiente',
              fechaInicio: new Date(Date.now() + 2 * 24 * 3600000),
              mensajeSolicitud: 'Quiero prepararme para el examen de reglas'
            }
          ];
          this.cargando = false;
        }
      });
    } else {
      // Si no hay usuario, cargar mock vacío
      this.misMentorias = [];
      this.cargando = false;
    }
  }

  // ====================================================================
  // NAVEGACIÓN Y FILTROS
  // ====================================================================
  cambiarTab(tab: 'disponibles' | 'mis-mentorias'): void {
    this.tabActivo = tab;
  }

  filtrarMentores(): void {
    const term = this.searchTerm.toLowerCase();
    this.mentoresFiltrados = this.mentores.filter(m =>
      m.nombre.toLowerCase().includes(term) || m.area.toLowerCase().includes(term)
    );
  }

  // ====================================================================
  // MODAL DE SOLICITUD
  // ====================================================================
  abrirModalSolicitar(): void {
    this.tabActivo = 'disponibles';
  }

  solicitarMentoria(mentor: Mentor): void {
    if (!this.currentUser) {
      this.notificacionService.mostrarError('Debes iniciar sesión.');
      return;
    }
    this.mentorSeleccionado = mentor;
    this.mensajeSolicitud = '';
    this.modalSolicitudVisible = true;
  }

  confirmarSolicitud(): void {
    if (!this.mentorSeleccionado || !this.currentUser) return;

    const payload: any = {
      mentor: this.mentorSeleccionado.id,
      aprendiz: this.currentUser.uid,
      area: this.mentorSeleccionado.area
    };
    if (this.mensajeSolicitud) {
      payload.mensaje = this.mensajeSolicitud;
    }

    this.comunidadService.solicitarMentoria(payload).subscribe({
      next: (nueva) => {
        const mentoriaLocal: MentoriaUI = {
          ...nueva,
          mentorNombre: this.mentorSeleccionado!.nombre,
          mentorAvatar: this.mentorSeleccionado!.avatar,
          aprendizId: nueva.aprendiz,
          aprendizNombre: this.currentUser?.nombre || 'Yo',
          fechaFin: undefined,
          mensajeSolicitud: this.mensajeSolicitud
        };
        this.misMentorias.unshift(mentoriaLocal);
        this.notificacionService.mostrarExito('Solicitud enviada correctamente');
        this.cancelarSolicitud();
        this.tabActivo = 'mis-mentorias';
      },
      error: () => {
        // Fallback offline
        const mentoriaLocal: MentoriaUI = {
          id: 'men' + Date.now(),
          mentor: this.mentorSeleccionado!.id,
          mentorNombre: this.mentorSeleccionado!.nombre,
          mentorAvatar: this.mentorSeleccionado!.avatar,
          aprendiz: this.currentUser!.uid || '3',
          aprendizId: this.currentUser!.uid || '3',
          aprendizNombre: this.currentUser?.nombre || 'Yo',
          area: this.mentorSeleccionado!.area,
          estado: 'pendiente',
          fechaInicio: new Date(),
          mensajeSolicitud: this.mensajeSolicitud
        };
        this.misMentorias.unshift(mentoriaLocal);
        this.notificacionService.mostrarExito('Solicitud enviada (modo offline)');
        this.cancelarSolicitud();
        this.tabActivo = 'mis-mentorias';
      }
    });
  }

  cancelarSolicitud(): void {
    this.modalSolicitudVisible = false;
    this.mentorSeleccionado = null;
    this.mensajeSolicitud = '';
  }

  // ====================================================================
  // ACCIONES SOBRE MENTORÍAS
  // ====================================================================
  verPerfil(mentor: Mentor): void {
    this.notificacionService.mostrarInfo('Ver perfil de ' + mentor.nombre);
  }

  iniciarChat(mentoria: MentoriaUI): void {
    this.notificacionService.mostrarInfo('Chat con ' + mentoria.mentorNombre);
  }

  aceptarSolicitud(mentoria: MentoriaUI): void {
    mentoria.estado = 'activa';
    this.notificacionService.mostrarExito('Solicitud aceptada');
    //llamar al backend para actualizar el estado
  }

  rechazarSolicitud(mentoria: MentoriaUI): void {
    mentoria.estado = 'completada'; // Estado válido para el backend
    this.notificacionService.mostrarExito('Solicitud rechazada');
  }

  finalizarMentoria(mentoria: MentoriaUI): void {
    mentoria.estado = 'completada';
    mentoria.fechaFin = new Date();
    this.notificacionService.mostrarExito('Mentoria finalizada');
  }

  // ====================================================================
  // MODAL DE FEEDBACK
  // ====================================================================
  darFeedback(mentoria: MentoriaUI): void {
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