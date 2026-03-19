import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AdminService } from '../../../core/services/admin.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';
import { SafeUrlPipe } from '../../../shared/biblioteca-offline/biblioteca-offline.component'; // Reutilizamos el pipe

export interface ItemPendiente {
  id: string;
  tipo: string;          // 'comentario', 'hilo', 'respuesta', 'documento'
  autor: string;
  fecha: Date;
  texto?: string;
  titulo?: string;
  contexto?: string;
  nombre?: string;        // para documentos
  descripcion?: string;   // para documentos
  tipoArchivo?: string;   // pdf, image, etc.
  url?: string;
}

@Component({
  selector: 'app-moderacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent,
    SafeUrlPipe
  ],
  templateUrl: './moderacion.component.html',
  styleUrls: ['./moderacion.component.scss']
})
export class ModeracionComponent implements OnInit {
  tabs = [
    { id: 'comentarios', nombre: 'Comentarios', icono: '💬', pendientes: 0 },
    { id: 'foros', nombre: 'Foros', icono: '📋', pendientes: 0 },
    { id: 'documentos', nombre: 'Documentos', icono: '📄', pendientes: 0 }
  ];
  tabActivo = 'comentarios';
  cargando = false;

  // Listas de elementos pendientes
  comentariosPendientes: ItemPendiente[] = [];
  forosPendientes: ItemPendiente[] = [];
  documentosPendientes: ItemPendiente[] = [];

  // Modal genérico
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalConfirmText = 'Aceptar';
  accionModal: { tipo: string; items?: ItemPendiente[]; item?: ItemPendiente; accion: string } | null = null;

  // Modal de vista previa de documento
  modalDocumentoVisible = false;
  documentoSeleccionado: ItemPendiente | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private notificacionService: NotificacionService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.cargarPendientes();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarPendientes(): void {
    this.cargando = true;
    // Simular carga desde servicio
    setTimeout(() => {
      this.comentariosPendientes = [
        {
          id: 'c1',
          tipo: 'comentario',
          autor: 'Juan Pérez',
          fecha: new Date(Date.now() - 2 * 3600000),
          texto: 'Excelente artículo, muy útil para principiantes.',
          contexto: 'Artículo: "Introducción a los foils"'
        },
        {
          id: 'c2',
          tipo: 'comentario',
          autor: 'María García',
          fecha: new Date(Date.now() - 5 * 3600000),
          texto: 'No estoy de acuerdo con la regla 42, debería revisarse.',
          contexto: 'Foro: Reglamento'
        }
      ];

      this.forosPendientes = [
        {
          id: 'f1',
          tipo: 'hilo',
          autor: 'Carlos López',
          fecha: new Date(Date.now() - 1 * 24 * 3600000),
          titulo: 'Duda sobre viradas',
          texto: '¿Cuál es la mejor técnica para virar en condiciones de viento fuerte?'
        },
        {
          id: 'f2',
          tipo: 'respuesta',
          autor: 'Ana Martínez',
          fecha: new Date(Date.now() - 3 * 3600000),
          texto: 'Yo recomiendo practicar con olas pequeñas primero.',
          contexto: 'Hilo: "Duda sobre viradas"'
        }
      ];

      this.documentosPendientes = [
        {
          id: 'd1',
          tipo: 'documento',
          autor: 'Pedro Sánchez',
          fecha: new Date(Date.now() - 12 * 3600000),
          nombre: 'Reglamento 2025 - borrador.pdf',
          descripcion: 'Propuesta de actualización del reglamento',
          tipoArchivo: 'pdf',
          url: '/assets/docs/borrador.pdf'
        },
        {
          id: 'd2',
          tipo: 'documento',
          autor: 'Laura Fernández',
          fecha: new Date(Date.now() - 2 * 24 * 3600000),
          nombre: 'Esquema de maniobras.jpg',
          descripcion: 'Diagrama explicativo',
          tipoArchivo: 'image',
          url: '/assets/images/esquema.jpg'
        }
      ];

      this.actualizarContadores();
      this.cargando = false;
    }, 600);
  }

  actualizarContadores(): void {
    this.tabs[0].pendientes = this.comentariosPendientes.length;
    this.tabs[1].pendientes = this.forosPendientes.length;
    this.tabs[2].pendientes = this.documentosPendientes.length;
  }

  cambiarTab(tabId: string): void {
    this.tabActivo = tabId;
  }

  hayPendientes(tab: string): boolean {
    switch (tab) {
      case 'comentarios': return this.comentariosPendientes.length > 0;
      case 'foros': return this.forosPendientes.length > 0;
      case 'documentos': return this.documentosPendientes.length > 0;
      default: return false;
    }
  }

  // Acciones individuales
  aprobarItem(item: ItemPendiente, tab: string): void {
    this.eliminarItem(item, tab);
    this.notificacionService.mostrarExito('Elemento aprobado');
  }

  rechazarItem(item: ItemPendiente, tab: string): void {
    this.eliminarItem(item, tab);
    this.notificacionService.mostrarExito('Elemento rechazado');
  }

  confirmarEliminar(item: ItemPendiente, tab: string): void {
    this.modalTitulo = 'Confirmar eliminación';
    this.modalMensaje = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.';
    this.modalConfirmText = 'Eliminar';
    this.accionModal = { tipo: tab, item, accion: 'eliminar' };
    this.modalVisible = true;
  }

  // Acciones masivas
  aprobarTodos(tab: string): void {
    this.modalTitulo = 'Aprobar todos';
    this.modalMensaje = `¿Estás seguro de que deseas aprobar todos los elementos pendientes en "${this.getNombreTab(tab)}"?`;
    this.modalConfirmText = 'Aprobar todos';
    this.accionModal = { tipo: tab, accion: 'aprobarTodos' };
    this.modalVisible = true;
  }

  rechazarTodos(tab: string): void {
    this.modalTitulo = 'Rechazar todos';
    this.modalMensaje = `¿Estás seguro de que deseas rechazar todos los elementos pendientes en "${this.getNombreTab(tab)}"?`;
    this.modalConfirmText = 'Rechazar todos';
    this.accionModal = { tipo: tab, accion: 'rechazarTodos' };
    this.modalVisible = true;
  }

  getNombreTab(tab: string): string {
    const t = this.tabs.find(t => t.id === tab);
    return t ? t.nombre : tab;
  }

  // Modal de confirmación
  confirmarAccionModal(): void {
    if (!this.accionModal) return;

    const { tipo, accion, item } = this.accionModal;

    if (accion === 'eliminar' && item) {
      this.eliminarItem(item, tipo);
      this.notificacionService.mostrarExito('Elemento eliminado');
    } else if (accion === 'aprobarTodos') {
      this.vaciarLista(tipo);
      this.notificacionService.mostrarExito(`Todos los elementos de "${this.getNombreTab(tipo)}" han sido aprobados`);
    } else if (accion === 'rechazarTodos') {
      this.vaciarLista(tipo);
      this.notificacionService.mostrarExito(`Todos los elementos de "${this.getNombreTab(tipo)}" han sido rechazados`);
    }

    this.modalVisible = false;
    this.accionModal = null;
  }

  cancelarModal(): void {
    this.modalVisible = false;
    this.accionModal = null;
  }

  private eliminarItem(item: ItemPendiente, tab: string): void {
    switch (tab) {
      case 'comentarios':
        this.comentariosPendientes = this.comentariosPendientes.filter(i => i.id !== item.id);
        break;
      case 'foros':
        this.forosPendientes = this.forosPendientes.filter(i => i.id !== item.id);
        break;
      case 'documentos':
        this.documentosPendientes = this.documentosPendientes.filter(i => i.id !== item.id);
        break;
    }
    this.actualizarContadores();
  }

  private vaciarLista(tab: string): void {
    switch (tab) {
      case 'comentarios':
        this.comentariosPendientes = [];
        break;
      case 'foros':
        this.forosPendientes = [];
        break;
      case 'documentos':
        this.documentosPendientes = [];
        break;
    }
    this.actualizarContadores();
  }

  // Vista previa de documento
  verDocumento(item: ItemPendiente): void {
    this.documentoSeleccionado = item;
    this.modalDocumentoVisible = true;
  }

  cerrarVistaPrevia(): void {
    this.modalDocumentoVisible = false;
    this.documentoSeleccionado = null;
  }
}