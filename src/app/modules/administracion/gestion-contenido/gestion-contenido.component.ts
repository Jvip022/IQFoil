import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { ContenidoService, Video, Modulo } from '../../../core/services/contenido.service';
import { DocumentoService, Documento } from '../../../core/services/documento.service';
import { ComunidadService, Hilo } from '../../../core/services/comunidad.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

@Component({
  selector: 'app-gestion-contenido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: 'gestion-contenido.component.html',
  styleUrls: ['gestion-contenido.component.scss']
})
export class GestionContenidoComponent implements OnInit, OnDestroy {
  // Pestañas
  tabs = [
    { id: 'videos', nombre: 'Videos', icono: '🎥' },
    { id: 'documentos', nombre: 'Documentos', icono: '📄' },
    { id: 'foro', nombre: 'Foro (hilos)', icono: '💬' }
  ];
  tabActivo = 'videos';

  // Estado de carga
  cargandoVideos = false;
  cargandoDocumentos = false;
  cargandoHilos = false;

  // Datos
  videos: Video[] = [];
  documentos: Documento[] = [];
  hilos: Hilo[] = [];

  // Subida de video
  nuevoVideo = { titulo: '', descripcion: '', nivel: 'principiante', url: '' };
  archivoVideo: File | null = null;

  // Subida de documento
  nuevoDocumento = { titulo: '', descripcion: '', tipo: 'pdf' };
  archivoDocumento: File | null = null;

  // Modales de confirmación
  modalEliminarVisible = false;
  elementoAEliminar: { tipo: string; id: string; nombre: string } | null = null;
  mensajeEliminar = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private contenidoService: ContenidoService,
    private documentoService: DocumentoService,
    private comunidadService: ComunidadService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarVideos();
    this.cargarDocumentos();
    this.cargarHilos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ==================== VIDEOS ====================
  cargarVideos(): void {
    this.cargandoVideos = true;
    this.contenidoService.getModulos().subscribe({
      next: (modulos: Modulo[]) => {
        this.videos = modulos.flatMap(m => m.videos);
        this.cargandoVideos = false;
      },
      error: () => {
        this.notificacionService.mostrarError('Error al cargar videos');
        this.cargandoVideos = false;
      }
    });
  }

  onVideoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoVideo = input.files[0];
    }
  }

  subirVideo(): void {
    if (!this.nuevoVideo.titulo || !this.archivoVideo) {
      this.notificacionService.mostrarAdvertencia('Título y archivo son obligatorios');
      return;
    }
    // Aquí se llamaría al servicio real para subir el video
    // Simulación:
    setTimeout(() => {
      const nuevo: Video = {
        id: Date.now().toString(),
        titulo: this.nuevoVideo.titulo,
        descripcion: this.nuevoVideo.descripcion,
        url: URL.createObjectURL(this.archivoVideo!),
        duracion: 0,
        nivel: this.nuevoVideo.nivel as any,
        progreso: 0,
        completado: false
      };
      this.videos.unshift(nuevo);
      this.notificacionService.mostrarExito('Video subido correctamente');
      this.nuevoVideo = { titulo: '', descripcion: '', nivel: 'principiante', url: '' };
      this.archivoVideo = null;
    }, 1000);
  }

  // ==================== DOCUMENTOS ====================
  cargarDocumentos(): void {
    this.cargandoDocumentos = true;
    this.documentoService.getDocumentos().subscribe({
      next: (docs: Documento[]) => {
        this.documentos = docs;
        this.cargandoDocumentos = false;
      },
      error: () => {
        this.notificacionService.mostrarError('Error al cargar documentos');
        this.cargandoDocumentos = false;
      }
    });
  }

  onDocumentoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoDocumento = input.files[0];
    }
  }

  subirDocumento(): void {
    if (!this.nuevoDocumento.titulo || !this.archivoDocumento) {
      this.notificacionService.mostrarAdvertencia('Título y archivo son obligatorios');
      return;
    }
    // Simulación de subida
    setTimeout(() => {
      const nuevo: Documento = {
        id: Date.now().toString(),
        titulo: this.nuevoDocumento.titulo,
        descripcion: this.nuevoDocumento.descripcion,
        archivoUrl: URL.createObjectURL(this.archivoDocumento!),
        tipo: this.nuevoDocumento.tipo as any,
        fechaSubida: new Date(),
        tamano: this.archivoDocumento!.size,
        autor: 'Admin'
      };
      this.documentos.unshift(nuevo);
      this.notificacionService.mostrarExito('Documento subido correctamente');
      this.nuevoDocumento = { titulo: '', descripcion: '', tipo: 'pdf' };
      this.archivoDocumento = null;
    }, 1000);
  }

  // ==================== FORO (HILOS) ====================
  cargarHilos(): void {
    this.cargandoHilos = true;
    this.comunidadService.getHilos().subscribe({
      next: (hilos: Hilo[]) => {
        this.hilos = hilos;
        this.cargandoHilos = false;
      },
      error: () => {
        this.notificacionService.mostrarError('Error al cargar hilos');
        this.cargandoHilos = false;
      }
    });
  }

  // ==================== ELIMINACIÓN GENÉRICA ====================
  confirmarEliminar(tipo: string, id: string, nombre: string): void {
    this.elementoAEliminar = { tipo, id, nombre };
    this.mensajeEliminar = `¿Estás seguro de que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`;
    this.modalEliminarVisible = true;
  }

  eliminarElemento(): void {
    if (!this.elementoAEliminar) return;
    const { tipo, id, nombre } = this.elementoAEliminar;
    switch (tipo) {
      case 'video':
        // Llamar al servicio de eliminación de video (simulado)
        this.videos = this.videos.filter(v => v.id !== id);
        this.notificacionService.mostrarExito(`Video "${nombre}" eliminado`);
        break;
      case 'documento':
        this.documentoService.eliminarDocumento(id).subscribe({
          next: () => {
            this.documentos = this.documentos.filter(d => d.id !== id);
            this.notificacionService.mostrarExito(`Documento "${nombre}" eliminado`);
          },
          error: () => this.notificacionService.mostrarError('Error al eliminar documento')
        });
        break;
      case 'hilo':
        // Llamar al servicio de eliminación de hilo (simulado, porque no existe en ComunidadService)
        this.hilos = this.hilos.filter(h => h.id !== id);
        this.notificacionService.mostrarExito(`Hilo "${nombre}" eliminado`);
        break;
    }
    this.modalEliminarVisible = false;
    this.elementoAEliminar = null;
  }

  cancelarEliminar(): void {
    this.modalEliminarVisible = false;
    this.elementoAEliminar = null;
  }
}