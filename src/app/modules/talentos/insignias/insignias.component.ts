import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { TalentoService, Insignia } from '../../../core/services/talento.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service'; // Para obtener usuarios reales

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

export interface Usuario {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-insignias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './insignias.component.html',
  styleUrls: ['./insignias.component.scss']
})
export class InsigniasComponent implements OnInit, OnDestroy {
  insignias: Insignia[] = [];
  insigniasFiltradas: Insignia[] = [];
  categorias: string[] = [];
  filtroCategoria = '';
  cargando = false;

  usuarios: Usuario[] = [];
  puedeOtorgar = false;

  insigniaSeleccionada: Insignia | null = null;
  modalOtorgarVisible = false;
  usuarioSeleccionadoId = '';
  insigniaAOtorgarId = '';

  get insigniasDisponibles(): Insignia[] {
    // Filtramos aquellas que NO tienen fechaObtenida (no obtenidas)
    return this.insignias.filter(i => !i.fechaObtenida);
  }

  private subscriptions: Subscription[] = [];

  constructor(
    private talentoService: TalentoService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.cargarInsignias();
    this.cargarUsuarios();
    this.verificarPermisos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ============================================================
  // CARGAR INSIGNIAS (con fallback)
  // ============================================================
  cargarInsignias(): void {
    this.cargando = true;
    this.talentoService.getInsignias().subscribe({
      next: (insignias) => {
        this.insignias = insignias;
        this.extraerCategorias();
        this.filtrarInsignias();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando insignias', err);
        this.notificacionService.mostrarError('No se pudieron cargar las insignias');
        // Aunque el servicio ya devuelve mock, por si acaso:
        this.insignias = [];
        this.cargando = false;
      }
    });
  }

  extraerCategorias(): void {
    const cats = new Set(this.insignias.map(i => i.categoria).filter(c => !!c));
    this.categorias = Array.from(cats) as string[];
  }

  filtrarInsignias(): void {
    if (!this.filtroCategoria) {
      this.insigniasFiltradas = this.insignias;
    } else {
      this.insigniasFiltradas = this.insignias.filter(i => i.categoria === this.filtroCategoria);
    }
  }

  // ============================================================
  // USUARIOS (desde backend o mock)
  // ============================================================
  cargarUsuarios(): void {
    this.adminService.getUsuarios().subscribe({
      next: (users) => {
        // Filtrar solo atletas (rol_id === 3) o todos según necesidad
        this.usuarios = users
          .filter(u => u.rol_id === 3) // asumiendo que rol_id=3 es atleta
          .map(u => ({ id: u.id.toString(), nombre: u.nombre }));
        if (this.usuarios.length === 0) {
          // Fallback a usuarios mock
          this.cargarUsuariosMock();
        }
      },
      error: () => {
        this.cargarUsuariosMock();
      }
    });
  }

  private cargarUsuariosMock(): void {
    this.usuarios = [
      { id: '3', nombre: 'Juan Pérez' },
      { id: '4', nombre: 'María García' },
      { id: '5', nombre: 'Pedro Rodríguez' },
      { id: '6', nombre: 'Luis Fernández' },
      { id: '7', nombre: 'Ana Torres' }
    ];
  }

  // ============================================================
  // PERMISOS
  // ============================================================
  verificarPermisos(): void {
    this.authService.getUser().subscribe(user => {
      this.puedeOtorgar = user?.roles?.includes('admin') || user?.roles?.includes('entrenador') || false;
    });
  }

  // ============================================================
  // DETALLE DE INSIGNIA
  // ============================================================
  seleccionarInsignia(insignia: Insignia): void {
    this.insigniaSeleccionada = insignia;
  }

  cerrarDetalle(): void {
    this.insigniaSeleccionada = null;
  }

  // ============================================================
  // OTORGAR INSIGNIA (con backend + simulación)
  // ============================================================
  abrirModalOtorgar(): void {
    if (this.insigniasDisponibles.length === 0) {
      this.notificacionService.mostrarAdvertencia('No hay insignias disponibles para otorgar.');
      return;
    }
    this.usuarioSeleccionadoId = '';
    this.insigniaAOtorgarId = '';
    this.modalOtorgarVisible = true;
  }

  cerrarModalOtorgar(): void {
    this.modalOtorgarVisible = false;
  }

  otorgarInsignia(): void {
    if (!this.usuarioSeleccionadoId || !this.insigniaAOtorgarId) {
      this.notificacionService.mostrarAdvertencia('Debes seleccionar un usuario y una insignia');
      return;
    }

    // Llamar al servicio para otorgar
    this.talentoService.otorgarInsignia(this.usuarioSeleccionadoId, this.insigniaAOtorgarId)
      .subscribe({
        next: (respuesta) => {
          if (respuesta.success) {
            // Actualizar la insignia en la lista local (marcar como obtenida)
            const idx = this.insignias.findIndex(i => i.id === this.insigniaAOtorgarId);
            if (idx !== -1) {
              this.insignias[idx] = {
                ...this.insignias[idx],
                fechaObtenida: new Date()
              };
              this.filtrarInsignias();
            }
            const nombreInsignia = this.insignias.find(i => i.id === this.insigniaAOtorgarId)?.nombre || '';
            this.notificacionService.mostrarExito(`Insignia "${nombreInsignia}" otorgada correctamente`);
          } else {
            this.notificacionService.mostrarError('Error al otorgar la insignia');
          }
          this.cerrarModalOtorgar();
        },
        error: () => {
          this.notificacionService.mostrarError('Error al otorgar la insignia');
          this.cerrarModalOtorgar();
        }
      });
  }
}