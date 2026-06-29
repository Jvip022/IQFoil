import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService, PreferenciasUsuario } from '../../../core/services/usuario.service';

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
  ) { }

  ngOnInit(): void {
    // Cargar configuración de apariencia desde localStorage
    this.cargarAparienciaDesdeLocalStorage();
    // Cargar el resto de la configuración
    this.cargarConfiguracion();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carga la apariencia desde localStorage y la aplica
   */
  private cargarAparienciaDesdeLocalStorage(): void {
    const tema = localStorage.getItem('tema') as 'claro' | 'oscuro' | 'sistema' | null;
    const tamanoFuente = localStorage.getItem('tamanoFuente') as 'pequeno' | 'mediano' | 'grande' | null;
    const contraste = localStorage.getItem('contraste') as 'normal' | 'alto' | null;

    if (tema) {
      this.configApariencia.tema = tema;
    }
    if (tamanoFuente) {
      this.configApariencia.tamanoFuente = tamanoFuente;
    }
    if (contraste) {
      this.configApariencia.contraste = contraste;
    }
    this.aplicarApariencia();
  }

  public aplicarApariencia(): void {
    console.log('🔄 Aplicando apariencia:', this.configApariencia);
    const html = document.documentElement;
    const { tema, tamanoFuente, contraste } = this.configApariencia;

    // 1. Tema
    if (tema === 'sistema') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', tema);
    }
    localStorage.setItem('tema', tema);

    // 2. Fuente
    html.classList.remove('fuente-pequeno', 'fuente-mediano', 'fuente-grande');
    html.classList.add(`fuente-${tamanoFuente}`);
    localStorage.setItem('tamanoFuente', tamanoFuente);

    // 3. Contraste
    html.classList.remove('contraste-normal', 'contraste-alto');
    html.classList.add(`contraste-${contraste}`);
    localStorage.setItem('contraste', contraste);

    // 🔥 Forzar repintado (opcional)
    document.body.style.display = 'none';
    document.body.offsetHeight; // reflow
    document.body.style.display = '';
  }

  cargarConfiguracion(): void {
    this.authService.getUser().subscribe({
      next: (user) => {
        if (user) {
          this.configGeneral.nombre = user.nombre || '';
          this.configGeneral.email = user.email || '';
          this.usuarioService.getPreferencias().subscribe({
            next: (pref: PreferenciasUsuario) => {
              this.configNotificaciones.emailNotificaciones = pref.notificacionesEmail ?? true;

              // 🔥 PRIORIDAD ABSOLUTA: localStorage
              const temaLocal = localStorage.getItem('tema') as 'claro' | 'oscuro' | 'sistema' | null;
              const tamanoLocal = localStorage.getItem('tamanoFuente') as 'pequeno' | 'mediano' | 'grande' | null;
              const contrasteLocal = localStorage.getItem('contraste') as 'normal' | 'alto' | null;

              this.configApariencia.tema = temaLocal || pref.tema || 'sistema';
              this.configApariencia.tamanoFuente = tamanoLocal || pref.tamanoFuente || 'mediano';
              this.configApariencia.contraste = contrasteLocal || pref.contraste || 'normal';

              this.aplicarApariencia();
              this.actualizarBackups();
              this.hayCambios = false;
            },
            error: () => {
              // Si falla el backend, usar solo localStorage
              this.cargarAparienciaDesdeLocalStorage();
              this.actualizarBackups();
            }
          });
        }
      },
      error: () => {
        // Si falla el usuario, usar solo localStorage
        this.cargarAparienciaDesdeLocalStorage();
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
    this.aplicarApariencia();
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

    // Guardar apariencia en localStorage (ya se hizo en tiempo real)
    const perfilActualizado = {
      nombre: this.configGeneral.nombre,
      email: this.configGeneral.email
    };

    this.usuarioService.actualizarPerfil(perfilActualizado).subscribe({
      next: () => {
        const preferencias: any = {
          idioma: this.configGeneral.idioma,
          notificacionesEmail: this.configNotificaciones.emailNotificaciones,
          tema: this.configApariencia.tema,
          tamanoFuente: this.configApariencia.tamanoFuente,
          contraste: this.configApariencia.contraste
        };
        this.usuarioService.actualizarPreferencias(preferencias).subscribe({
          next: () => {
            this.aplicarApariencia();
            this.actualizarBackups();
            this.hayCambios = false;
            this.guardando = false;
            this.notificacionService.mostrarExito('Configuración guardada correctamente');
          },
          error: (err) => {
            console.error('Error guardando preferencias', err);
            this.notificacionService.mostrarAdvertencia('Configuración guardada localmente, pero no se pudo sincronizar con el servidor.');
            this.actualizarBackups();
            this.hayCambios = false;
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
    this.notificacionService.mostrarExito('Cuenta eliminada. Redirigiendo...');
    this.modalEliminarVisible = false;
    // En producción, llamar a un endpoint de eliminación
    // this.authService.logout();
    // this.router.navigate(['/login']);
  }

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
}