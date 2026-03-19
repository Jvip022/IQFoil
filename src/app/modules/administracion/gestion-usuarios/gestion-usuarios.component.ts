import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'atleta' | 'entrenador' | 'admin';
  activo: boolean;
  ultimoAcceso: Date;
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.scss']
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  cargando = false;

  filtroBusqueda = '';
  filtroRol = '';
  filtroEstado = '';

  // Modal de usuario
  modalUsuarioVisible = false;
  modoEdicion = false;
  formUsuario: Partial<Usuario & { password?: string }> = {};

  // Modal de eliminación
  modalEliminarVisible = false;
  usuarioAEliminar: Usuario | null = null;
  mensajeEliminar = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarUsuarios(): void {
    this.cargando = true;
    // Simular carga desde servicio
    setTimeout(() => {
      this.usuarios = [
        { id: '1', nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'atleta', activo: true, ultimoAcceso: new Date(Date.now() - 2 * 3600000) },
        { id: '2', nombre: 'María García', email: 'maria@example.com', rol: 'entrenador', activo: true, ultimoAcceso: new Date(Date.now() - 1 * 24 * 3600000) },
        { id: '3', nombre: 'Carlos López', email: 'carlos@example.com', rol: 'admin', activo: true, ultimoAcceso: new Date(Date.now() - 3 * 24 * 3600000) },
        { id: '4', nombre: 'Ana Martínez', email: 'ana@example.com', rol: 'atleta', activo: false, ultimoAcceso: new Date(Date.now() - 10 * 24 * 3600000) },
        { id: '5', nombre: 'Pedro Sánchez', email: 'pedro@example.com', rol: 'atleta', activo: true, ultimoAcceso: new Date(Date.now() - 5 * 3600000) }
      ];
      this.filtrarUsuarios();
      this.cargando = false;
      this.notificacionService.mostrarExito('Usuarios cargados correctamente');
    }, 500);
  }

  filtrarUsuarios(): void {
    let filtrados = this.usuarios;

    if (this.filtroBusqueda) {
      const term = this.filtroBusqueda.toLowerCase();
      filtrados = filtrados.filter(u =>
        u.nombre.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      );
    }

    if (this.filtroRol) {
      filtrados = filtrados.filter(u => u.rol === this.filtroRol);
    }

    if (this.filtroEstado) {
      const activo = this.filtroEstado === 'activo';
      filtrados = filtrados.filter(u => u.activo === activo);
    }

    this.usuariosFiltrados = filtrados;
  }

  // Modal nuevo usuario
  abrirModalNuevoUsuario(): void {
    this.modoEdicion = false;
    this.formUsuario = {
      nombre: '',
      email: '',
      password: '',
      rol: 'atleta',
      activo: true
    };
    this.modalUsuarioVisible = true;
  }

  editarUsuario(user: Usuario): void {
    this.modoEdicion = true;
    this.formUsuario = { ...user };
    this.modalUsuarioVisible = true;
  }

  cerrarModalUsuario(): void {
    this.modalUsuarioVisible = false;
  }

  guardarUsuario(): void {
    if (!this.formUsuario.nombre || !this.formUsuario.email) {
      this.notificacionService.mostrarAdvertencia('Nombre y email son obligatorios');
      return;
    }
    if (!this.modoEdicion && !this.formUsuario.password) {
      this.notificacionService.mostrarAdvertencia('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    if (this.modoEdicion) {
      // Actualizar usuario existente
      const index = this.usuarios.findIndex(u => u.id === this.formUsuario.id);
      if (index !== -1) {
        this.usuarios[index] = { ...this.usuarios[index], ...this.formUsuario } as Usuario;
        this.notificacionService.mostrarExito('Usuario actualizado correctamente');
      }
    } else {
      // Crear nuevo usuario
      const nuevoId = (this.usuarios.length + 1).toString();
      const nuevoUsuario: Usuario = {
        id: nuevoId,
        nombre: this.formUsuario.nombre!,
        email: this.formUsuario.email!,
        rol: this.formUsuario.rol as 'atleta' | 'entrenador' | 'admin',
        activo: this.formUsuario.activo ?? true,
        ultimoAcceso: new Date()
      };
      this.usuarios.push(nuevoUsuario);
      this.notificacionService.mostrarExito('Usuario creado correctamente');
    }
    this.filtrarUsuarios();
    this.cerrarModalUsuario();
  }

  toggleEstadoUsuario(user: Usuario): void {
    user.activo = !user.activo;
    this.notificacionService.mostrarExito(`Usuario ${user.activo ? 'activado' : 'desactivado'}`);
    // En un caso real, se llamaría al servicio para persistir el cambio
  }

  confirmarEliminar(user: Usuario): void {
    this.usuarioAEliminar = user;
    this.mensajeEliminar = `¿Estás seguro de que deseas eliminar al usuario "${user.nombre}"? Esta acción no se puede deshacer.`;
    this.modalEliminarVisible = true;
  }

  cancelarEliminar(): void {
    this.modalEliminarVisible = false;
    this.usuarioAEliminar = null;
  }

  eliminarUsuario(): void {
    if (this.usuarioAEliminar) {
      this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioAEliminar!.id);
      this.filtrarUsuarios();
      this.notificacionService.mostrarExito('Usuario eliminado correctamente');
    }
    this.cancelarEliminar();
  }
}