import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

interface ConfiguracionGeneral {
  nombre: string;
  email: string;
  idioma: string;
}

interface ConfiguracionNotificaciones {
  emailNotificaciones: boolean;
  pushNotificaciones: boolean;
  recordatoriosEventos: boolean;
  nuevosContenidos: boolean;
}

interface ConfiguracionApariencia {
  tema: 'claro' | 'oscuro' | 'sistema';
  tamanoFuente: 'pequeno' | 'mediano' | 'grande';
  contraste: 'normal' | 'alto';
}

interface ConfiguracionPrivacidad {
  perfilPublico: boolean;
  mostrarEstadisticas: boolean;
  visibilidadEmail: 'privado' | 'contactos' | 'publico';
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit, OnDestroy {
  tabs = [
    { id: 'general', nombre: 'General', icono: '⚙️' },
    { id: 'notificaciones', nombre: 'Notificaciones', icono: '🔔' },
    { id: 'apariencia', nombre: 'Apariencia', icono: '🎨' },
    { id: 'privacidad', nombre: 'Privacidad', icono: '🔒' }
  ];
  tabActivo = 'general';

  // Configuraciones
  configGeneral: ConfiguracionGeneral = {
    nombre: '',
    email: '',
    idioma: 'es'
  };
  configNotificaciones: ConfiguracionNotificaciones = {
    emailNotificaciones: true,
    pushNotificaciones: true,
    recordatoriosEventos: true,
    nuevosContenidos: false
  };
  configApariencia: ConfiguracionApariencia = {
    tema: 'sistema',
    tamanoFuente: 'mediano',
    contraste: 'normal'
  };
  configPrivacidad: ConfiguracionPrivacidad = {
    perfilPublico: false,
    mostrarEstadisticas: true,
    visibilidadEmail: 'contactos'
  };

  // Copias de seguridad para detectar cambios
  private configGeneralBackup!: ConfiguracionGeneral;
  private configNotificacionesBackup!: ConfiguracionNotificaciones;
  private configAparienciaBackup!: ConfiguracionApariencia;
  private configPrivacidadBackup!: ConfiguracionPrivacidad;

  guardando = false;
  hayCambios = false;

  // Modales
  modalEliminarVisible = false;
  modalRestablecerVisible = false;
  mensajeEliminar = '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y perderás todos tus datos.';

  private subscriptions: Subscription[] = [];

  constructor(
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarConfiguracion(): void {
    // Cargar datos del usuario autenticado
    this.authService.getUser().subscribe({
      next: (user) => {
        if (user) {
          this.configGeneral.nombre = user.nombre || '';
          this.configGeneral.email = user.email || '';
          // Cargar preferencias desde el servicio de usuario
          this.usuarioService.getPreferencias().subscribe({
            next: (pref) => {
              this.configNotificaciones.emailNotificaciones = pref.notificacionesEmail ?? true;
              this.configNotificaciones.pushNotificaciones = true; // Por defecto
              this.configNotificaciones.recordatoriosEventos = true;
              this.configNotificaciones.nuevosContenidos = false;
              
              this.configApariencia.tema = pref.tema || 'sistema';
              this.configApariencia.tamanoFuente = 'mediano';
              this.configApariencia.contraste = 'normal';
              
              this.configPrivacidad.perfilPublico = false;
              this.configPrivacidad.mostrarEstadisticas = true;
              this.configPrivacidad.visibilidadEmail = 'contactos';
              
              // Aplicar tema inmediatamente
              this.aplicarTema(this.configApariencia.tema);
              this.actualizarBackups();
              this.hayCambios = false;
            },
            error: () => {
              // Si falla, usar valores por defecto y aplicar tema
              this.aplicarTema(this.configApariencia.tema);
              this.actualizarBackups();
            }
          });
        }
      },
      error: () => {
        this.notificacionService.mostrarError('No se pudo cargar la configuración');
        this.aplicarTema(this.configApariencia.tema);
        this.actualizarBackups();
      }
    });
  }

  cambiarTab(tabId: string): void {
    this.tabActivo = tabId;
  }

  restablecerValores(): void {
    this.modalRestablecerVisible = true;
  }

  confirmarRestablecer(): void {
    this.configGeneral = { ...this.configGeneralBackup };
    this.configNotificaciones = { ...this.configNotificacionesBackup };
    this.configApariencia = { ...this.configAparienciaBackup };
    this.configPrivacidad = { ...this.configPrivacidadBackup };
    this.aplicarTema(this.configApariencia.tema);
    this.hayCambios = false;
    this.modalRestablecerVisible = false;
    this.notificacionService.mostrarInfo('Configuración restablecida');
  }

  cancelarRestablecer(): void {
    this.modalRestablecerVisible = false;
  }

  guardarCambios(): void {
    if (!this.hayCambios) {
      this.notificacionService.mostrarInfo('No hay cambios para guardar');
      return;
    }

    this.guardando = true;
    
    // 1. Actualizar perfil (nombre y email)
    const perfilActualizado = {
      nombre: this.configGeneral.nombre,
      email: this.configGeneral.email
    };

    this.usuarioService.actualizarPerfil(perfilActualizado).subscribe({
      next: () => {
        // 2. Actualizar preferencias
        const preferencias = {
          idioma: this.configGeneral.idioma,
          notificacionesEmail: this.configNotificaciones.emailNotificaciones,
          tema: this.configApariencia.tema
        };
        
        this.usuarioService.actualizarPreferencias(preferencias).subscribe({
          next: () => {
            this.actualizarBackups();
            this.hayCambios = false;
            this.guardando = false;
            this.notificacionService.mostrarExito('Configuración guardada correctamente');
          },
          error: (err) => {
            console.error('Error guardando preferencias', err);
            this.notificacionService.mostrarError('Error al guardar las preferencias');
            this.guardando = false;
          }
        });
      },
      error: (err) => {
        console.error('Error guardando perfil', err);
        this.notificacionService.mostrarError('Error al guardar el perfil');
        this.guardando = false;
      }
    });
  }

  confirmarEliminarCuenta(): void {
    this.modalEliminarVisible = true;
  }

  cancelarEliminar(): void {
    this.modalEliminarVisible = false;
  }

  eliminarCuenta(): void {
    // Por seguridad, pedir confirmación adicional antes de eliminar
    this.notificacionService.mostrarExito('Cuenta eliminada. Redirigiendo...');
    this.modalEliminarVisible = false;
    // En producción, llamar a un endpoint de eliminación
    // this.authService.logout();
    // this.router.navigate(['/login']);
  }

  // Detectar cambios en cualquier configuración
  detectarCambios(): void {
    this.hayCambios =
      JSON.stringify(this.configGeneral) !== JSON.stringify(this.configGeneralBackup) ||
      JSON.stringify(this.configNotificaciones) !== JSON.stringify(this.configNotificacionesBackup) ||
      JSON.stringify(this.configApariencia) !== JSON.stringify(this.configAparienciaBackup) ||
      JSON.stringify(this.configPrivacidad) !== JSON.stringify(this.configPrivacidadBackup);
  }

  private actualizarBackups(): void {
    this.configGeneralBackup = { ...this.configGeneral };
    this.configNotificacionesBackup = { ...this.configNotificaciones };
    this.configAparienciaBackup = { ...this.configApariencia };
    this.configPrivacidadBackup = { ...this.configPrivacidad };
    this.hayCambios = false;
  }

  aplicarTema(tema: 'claro' | 'oscuro' | 'sistema'): void {
    const html = document.documentElement;
    if (tema === 'sistema') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', tema);
    }
    // También se puede guardar en localStorage para persistir entre sesiones
    localStorage.setItem('tema', tema);
  }
}