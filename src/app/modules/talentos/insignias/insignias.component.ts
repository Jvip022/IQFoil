import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { TalentoService, Insignia } from '../../../core/services/talento.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';

// Componentes compartidos
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
    // Filtramos aquellas que no tienen fechaObtenida (no obtenidas)
    return this.insignias.filter(i => !i.fechaObtenida);
  }

  private subscriptions: Subscription[] = [];

  constructor(
    private talentoService: TalentoService,
    private notificacionService: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarInsignias();
    this.cargarUsuarios();
    this.verificarPermisos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarInsignias(): void {
    this.cargando = true;
    this.talentoService.getInsignias().subscribe({
      next: (insignias: Insignia[]) => {
        this.insignias = insignias;
        this.extraerCategorias();
        this.filtrarInsignias();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error cargando insignias', err);
        this.notificacionService.mostrarError('No se pudieron cargar las insignias');
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

  cargarUsuarios(): void {
    this.usuarios = [
      { id: '1', nombre: 'Juan Pérez' },
      { id: '2', nombre: 'María García' },
      { id: '3', nombre: 'Carlos López' },
      { id: '4', nombre: 'Ana Martínez' }
    ];
  }

  verificarPermisos(): void {
    this.authService.getUser().subscribe(user => {
      this.puedeOtorgar = user?.roles?.includes('admin') || user?.roles?.includes('entrenador') || false;
    });
  }

  seleccionarInsignia(insignia: Insignia): void {
    this.insigniaSeleccionada = insignia;
  }

  cerrarDetalle(): void {
    this.insigniaSeleccionada = null;
  }

  abrirModalOtorgar(): void {
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

    const insignia = this.insignias.find(i => i.id === this.insigniaAOtorgarId);
    if (insignia) {
      // Simulación: marcar como obtenida estableciendo fechaObtenida
      const idx = this.insignias.findIndex(i => i.id === this.insigniaAOtorgarId);
      if (idx !== -1) {
        this.insignias[idx] = {
          ...this.insignias[idx],
          fechaObtenida: new Date()
        };
        this.filtrarInsignias();
      }

      this.notificacionService.mostrarExito(`Insignia "${insignia.nombre}" otorgada correctamente`);
      this.cerrarModalOtorgar();
    }
  }
}