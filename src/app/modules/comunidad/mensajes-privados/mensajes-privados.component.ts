import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';

// Interfaces
export interface Usuario {
  id: string;
  nombre: string;
  avatar?: string;
}

export interface Mensaje {
  id: string;
  conversacionId: string;
  remitenteId: string;
  contenido: string;
  fecha: Date;
  esPropio: boolean;
}

export interface Conversacion {
  id: string;
  otroUsuarioId: string;
  nombre: string;
  avatar?: string;
  ultimoMensaje: string;
  ultimaActividad: Date;
  noLeidos: number;
}

@Component({
  selector: 'app-mensajes-privados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './mensajes-privados.component.html',
  styleUrls: ['./mensajes-privados.component.scss']
})
export class MensajesPrivadosComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  // Estado
  cargandoConversaciones = false;
  cargandoMensajes = false;
  enviando = false;

  // Datos
  conversaciones: Conversacion[] = [];
  conversacionesFiltradas: Conversacion[] = [];
  busquedaConversaciones = '';

  conversacionActiva: Conversacion | null = null;
  mensajes: Mensaje[] = [];
  nuevoMensaje = '';
  autoScroll = true;

  // Modal nueva conversación
  modalNuevaConvVisible = false;
  busquedaUsuario = '';
  usuariosResultados: Usuario[] = [];
  usuarioDestino: Usuario | null = null;

  private subscriptions: Subscription[] = [];
  private currentUserId = 'usuario-actual'; // Reemplazar con ID real desde AuthService

  constructor(
    private notificacionService: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarConversaciones();
    // Obtener usuario actual (ejemplo)
    this.authService.getUser().subscribe(user => {
      if (user?.uid) this.currentUserId = user.uid;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked(): void {
    if (this.autoScroll) {
      this.scrollAlFinal();
    }
  }

  // Carga de conversaciones (simulada)
  cargarConversaciones(): void {
    this.cargandoConversaciones = true;
    setTimeout(() => {
      this.conversaciones = [
        {
          id: 'conv1',
          otroUsuarioId: 'user2',
          nombre: 'Carlos López',
          avatar: '',
          ultimoMensaje: 'Hola, ¿cómo estás?',
          ultimaActividad: new Date(Date.now() - 2 * 3600000),
          noLeidos: 2
        },
        {
          id: 'conv2',
          otroUsuarioId: 'user3',
          nombre: 'María García',
          avatar: '',
          ultimoMensaje: 'Nos vemos mañana en la regata',
          ultimaActividad: new Date(Date.now() - 5 * 3600000),
          noLeidos: 0
        },
        {
          id: 'conv3',
          otroUsuarioId: 'user4',
          nombre: 'Ana Martínez',
          avatar: '',
          ultimoMensaje: '¿Puedes revisar el documento?',
          ultimaActividad: new Date(Date.now() - 1 * 24 * 3600000),
          noLeidos: 1
        }
      ];
      this.conversacionesFiltradas = [...this.conversaciones];
      this.cargandoConversaciones = false;
    }, 800);
  }

  filtrarConversaciones(): void {
    const term = this.busquedaConversaciones.toLowerCase();
    this.conversacionesFiltradas = this.conversaciones.filter(c =>
      c.nombre.toLowerCase().includes(term)
    );
  }

  // Seleccionar conversación
  seleccionarConversacion(conversacion: Conversacion): void {
    this.conversacionActiva = conversacion;
    this.cargarMensajes(conversacion.id);
    // Marcar como leídos
    conversacion.noLeidos = 0;
  }

  cargarMensajes(conversacionId: string): void {
    this.cargandoMensajes = true;
    setTimeout(() => {
      // Simular mensajes
      this.mensajes = [
        {
          id: 'm1',
          conversacionId,
          remitenteId: this.currentUserId,
          contenido: 'Hola, ¿cómo estás?',
          fecha: new Date(Date.now() - 2 * 3600000),
          esPropio: true
        },
        {
          id: 'm2',
          conversacionId,
          remitenteId: this.conversacionActiva!.otroUsuarioId,
          contenido: 'Bien, ¿y tú?',
          fecha: new Date(Date.now() - 1.5 * 3600000),
          esPropio: false
        },
        {
          id: 'm3',
          conversacionId,
          remitenteId: this.currentUserId,
          contenido: 'Preparándome para la regata del sábado',
          fecha: new Date(Date.now() - 1 * 3600000),
          esPropio: true
        },
        {
          id: 'm4',
          conversacionId,
          remitenteId: this.conversacionActiva!.otroUsuarioId,
          contenido: '¡Qué bien! Yo también voy a participar',
          fecha: new Date(Date.now() - 30 * 60000),
          esPropio: false
        }
      ];
      this.cargandoMensajes = false;
      this.autoScroll = true;
    }, 500);
  }

  cerrarConversacion(): void {
    this.conversacionActiva = null;
    this.mensajes = [];
  }

  // Enviar mensaje
   enviarMensaje(event?: Event): void {   // Cambiado a Event
    if (event) {
      const keyboardEvent = event as KeyboardEvent; // Casting
      if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
        keyboardEvent.preventDefault();
        if (!this.nuevoMensaje.trim()) return;
      } else {
        return;
      }
    }

    if (!this.conversacionActiva || !this.nuevoMensaje.trim()) return;

    this.enviando = true;
    setTimeout(() => {
      const nuevoMensaje: Mensaje = {
        id: Date.now().toString(),
        conversacionId: this.conversacionActiva!.id,
        remitenteId: this.currentUserId,
        contenido: this.nuevoMensaje,
        fecha: new Date(),
        esPropio: true
      };
      this.mensajes.push(nuevoMensaje);
      const conv = this.conversaciones.find(c => c.id === this.conversacionActiva!.id);
      if (conv) {
        conv.ultimoMensaje = this.nuevoMensaje;
        conv.ultimaActividad = new Date();
      }
      this.nuevoMensaje = '';
      this.enviando = false;
      this.autoScroll = true;
    }, 300);
  }

  scrollAlFinal(): void {
    try {
      if (this.mensajesContainer) {
        this.mensajesContainer.nativeElement.scrollTop = this.mensajesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  get hayNuevosMensajes(): boolean {
    // Se podría implementar lógica real de nuevos mensajes mientras se está en la conversación
    return false;
  }

  // Nueva conversación
  abrirNuevaConversacion(): void {
    this.modalNuevaConvVisible = true;
    this.busquedaUsuario = '';
    this.usuariosResultados = [];
    this.usuarioDestino = null;
  }

  cerrarModalNuevaConv(): void {
    this.modalNuevaConvVisible = false;
  }

  buscarUsuarios(): void {
    if (!this.busquedaUsuario.trim()) {
      this.usuariosResultados = [];
      return;
    }
    // Simular búsqueda
    setTimeout(() => {
      this.usuariosResultados = [
        { id: 'user5', nombre: 'Pedro Sánchez', avatar: '' },
        { id: 'user6', nombre: 'Laura Fernández', avatar: '' },
        { id: 'user7', nombre: 'Javier Ruiz', avatar: '' }
      ].filter(u => u.nombre.toLowerCase().includes(this.busquedaUsuario.toLowerCase()));
    }, 300);
  }

  seleccionarUsuarioDestino(usuario: Usuario): void {
    this.usuarioDestino = usuario;
  }

  iniciarNuevaConversacion(): void {
    if (!this.usuarioDestino) {
      this.notificacionService.mostrarAdvertencia('Selecciona un usuario');
      return;
    }
    // Crear nueva conversación (simulado)
    const nuevaConv: Conversacion = {
      id: 'conv' + Date.now(),
      otroUsuarioId: this.usuarioDestino.id,
      nombre: this.usuarioDestino.nombre,
      avatar: this.usuarioDestino.avatar,
      ultimoMensaje: '',
      ultimaActividad: new Date(),
      noLeidos: 0
    };
    this.conversaciones.unshift(nuevaConv);
    this.conversacionesFiltradas = [...this.conversaciones];
    this.seleccionarConversacion(nuevaConv);
    this.cerrarModalNuevaConv();
    this.notificacionService.mostrarExito('Conversación iniciada');
  }
}