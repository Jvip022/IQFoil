import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';
import { DocumentoService, Documento } from '../../../core/services/documento.service';
import { ComunidadService, Hilo, Mensaje } from '../../../core/services/comunidad.service';
import { EvaluacionService, VideoPractica } from '../../../core/services/evaluacion.service';
import { AdminService } from '../../../core/services/admin.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';
import { SafeUrlPipe } from '../../../shared/biblioteca-offline/biblioteca-offline.component';

export interface ItemPendiente {
  id: string;
  tipo: string;
  autor: string;
  fecha: Date;
  texto?: string;
  titulo?: string;
  contexto?: string;
  nombre?: string;
  descripcion?: string;
  tipoArchivo?: string;
  url?: string;
  itemOriginal?: any; // guardar referencia al objeto original
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
    { id: 'comentarios', nombre: 'Prácticas pendientes', icono: '🎥', pendientes: 0 },
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
    private documentoService: DocumentoService,
    private comunidadService: ComunidadService,
    private evaluacionService: EvaluacionService,
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

    forkJoin({
      documentos: this.documentoService.getDocumentos().pipe(take(1)),
      hilos: this.comunidadService.getHilos().pipe(take(1)),
      evaluaciones: this.evaluacionService.getVideosPendientes().pipe(take(1))
    }).subscribe({
      next: ({ documentos, hilos, evaluaciones }) => {
        // Procesar documentos pendientes (no aprobados)
        this.documentosPendientes = documentos
          .filter((doc: any) => doc.aprobado === false || doc.aprobado === undefined)
          .map((doc: any) => ({
            id: doc.id,
            tipo: 'documento',
            autor: doc.autor || 'Anónimo',
            fecha: new Date(doc.fechaSubida || Date.now()),
            nombre: doc.titulo,
            descripcion: doc.descripcion || '',
            tipoArchivo: doc.tipo || 'pdf',
            url: doc.archivoUrl || '',
            itemOriginal: doc
          }));

        // Procesar hilos y respuestas (foros)
        this.forosPendientes = hilos.map((hilo: any) => ({
          id: hilo.id,
          tipo: 'hilo',
          autor: hilo.autor || 'Anónimo',
          fecha: new Date(hilo.fechaCreacion || Date.now()),
          titulo: hilo.titulo,
          texto: hilo.contenido || '',
          contexto: `Foro: ${hilo.foroId || 'General'}`,
          itemOriginal: hilo
        }));

        // Procesar evaluaciones pendientes como "comentarios" (prácticas por evaluar)
        this.comentariosPendientes = evaluaciones.map((ev: any) => ({
          id: ev.id,
          tipo: 'evaluacion',
          autor: `Usuario ${ev.usuarioId}`,
          fecha: new Date(ev.fechaSubida || Date.now()),
          texto: ev.titulo || 'Práctica pendiente de evaluar',
          contexto: `Práctica subida el ${new Date(ev.fechaSubida).toLocaleDateString()}`,
          itemOriginal: ev
        }));

        this.actualizarContadores();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando datos de moderación:', err);
        this.notificacionService.mostrarError('No se pudieron cargar los elementos pendientes');
        this.cargando = false;
      }
    });
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
    // Simular aprobación (en backend se actualizaría el estado)
    this.eliminarItem(item, tab);
    this.notificacionService.mostrarExito('Elemento aprobado');
    // Aquí se llamaría al servicio correspondiente para aprobar en backend
  }

  rechazarItem(item: ItemPendiente, tab: string): void {
    // Simular rechazo (en backend se eliminaría o marcaría como rechazado)
    this.eliminarItem(item, tab);
    this.notificacionService.mostrarExito('Elemento rechazado');
    // Aquí se llamaría al servicio correspondiente para rechazar en backend
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
      // Llamar a servicio de eliminación real
      this.eliminarEnBackend(item, tipo);
    } else if (accion === 'aprobarTodos') {
      this.vaciarLista(tipo);
      this.notificacionService.mostrarExito(`Todos los elementos de "${this.getNombreTab(tipo)}" han sido aprobados`);
      // Aquí se llamaría al servicio para aprobar todos
    } else if (accion === 'rechazarTodos') {
      this.vaciarLista(tipo);
      this.notificacionService.mostrarExito(`Todos los elementos de "${this.getNombreTab(tipo)}" han sido rechazados`);
      // Aquí se llamaría al servicio para rechazar todos
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

  private eliminarEnBackend(item: ItemPendiente, tab: string): void {
    // Llamar al servicio correspondiente para eliminar en backend
    switch (tab) {
      case 'documentos':
        if (item.id) {
          this.documentoService.eliminarDocumento(item.id).subscribe({
            next: () => console.log('Documento eliminado del backend'),
            error: (err) => console.error('Error eliminando documento:', err)
          });
        }
        break;
      case 'foros':
        if (item.id) {
          this.comunidadService.eliminarHilo(item.id).subscribe({
            next: () => console.log('Hilo eliminado del backend'),
            error: (err) => console.error('Error eliminando hilo:', err)
          });
        }
        break;
      case 'comentarios':
        // No hay endpoint de eliminación para evaluaciones pendientes, pero podríamos
        // llamar a un endpoint si existiera
        console.log('Eliminación de evaluación pendiente no implementada');
        break;
    }
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