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
  private configGeneralBackup: ConfiguracionGeneral;
  private configNotificacionesBackup: ConfiguracionNotificaciones;
  private configAparienciaBackup: ConfiguracionApariencia;
  private configPrivacidadBackup: ConfiguracionPrivacidad;

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
  ) {
    // Inicializar backups
    this.configGeneralBackup = { ...this.configGeneral };
    this.configNotificacionesBackup = { ...this.configNotificaciones };
    this.configAparienciaBackup = { ...this.configApariencia };
    this.configPrivacidadBackup = { ...this.configPrivacidad };
  }

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarConfiguracion(): void {
    // Simular carga desde el servicio
    setTimeout(() => {
      // Valores de ejemplo
      this.configGeneral = {
        nombre: 'Usuario Demo',
        email: 'usuario@example.com',
        idioma: 'es'
      };
      this.configNotificaciones = {
        emailNotificaciones: true,
        pushNotificaciones: true,
        recordatoriosEventos: true,
        nuevosContenidos: false
      };
      this.configApariencia = {
        tema: 'sistema',
        tamanoFuente: 'mediano',
        contraste: 'normal'
      };
      this.configPrivacidad = {
        perfilPublico: false,
        mostrarEstadisticas: true,
        visibilidadEmail: 'contactos'
      };
      this.actualizarBackups();
      this.notificacionService.mostrarExito('Configuración cargada correctamente');
    }, 500);
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
    this.hayCambios = false;
    this.modalRestablecerVisible = false;
    this.notificacionService.mostrarInfo('Configuración restablecida');
  }

  cancelarRestablecer(): void {
    this.modalRestablecerVisible = false;
  }

  guardarCambios(): void {
    this.guardando = true;
    // Simular guardado
    setTimeout(() => {
      this.actualizarBackups();
      this.hayCambios = false;
      this.guardando = false;
      this.notificacionService.mostrarExito('Configuración guardada correctamente');
    }, 800);
  }

  confirmarEliminarCuenta(): void {
    this.modalEliminarVisible = true;
  }

  cancelarEliminar(): void {
    this.modalEliminarVisible = false;
  }

  eliminarCuenta(): void {
    // Simular eliminación
    setTimeout(() => {
      this.modalEliminarVisible = false;
      this.notificacionService.mostrarExito('Cuenta eliminada. Redirigiendo...');
      // Aquí se llamaría al servicio de autenticación para cerrar sesión y eliminar cuenta
      // this.authService.logout();
      // this.router.navigate(['/login']);
    }, 800);
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
}
}