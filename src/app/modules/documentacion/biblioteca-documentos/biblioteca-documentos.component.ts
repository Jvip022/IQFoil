import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DocumentoService, Documento } from '../../../core/services/documento.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { OfflineService } from '../../../core/services/offline.service';
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';
import { FileSizePipe, SafeUrlPipe } from '../../../shared/biblioteca-offline/biblioteca-offline.component';

@Component({
  selector: 'app-biblioteca-documentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent,
    FileSizePipe,
    SafeUrlPipe
  ],
  templateUrl: './biblioteca-documentos.component.html',
  styleUrls: ['./biblioteca-documentos.component.scss']
})
export class BibliotecaDocumentosComponent implements OnInit, OnDestroy {
  cargando = true;
  documentos: Documento[] = [];
  filteredDocuments: Documento[] = [];
  searchTerm = '';
  filtroTipo = '';
  ordenPor = 'fechaDesc';
  vista: 'grid' | 'lista' = 'grid';

  documentoSeleccionado: Documento | null = null;
  modalSubidaVisible = false;
  modoEdicion = false;
  modalEliminarVisible = false;
  documentoAEliminar: Documento | null = null;

  formData: Partial<Documento> = { titulo: '', descripcion: '', tipo: 'pdf' };
  archivoSeleccionado: File | null = null;

  get mensajeEliminar(): string {
    return this.documentoAEliminar
      ? `¿Estás seguro de que deseas eliminar el documento "${this.documentoAEliminar.titulo}"? Esta acción no se puede deshacer.`
      : '';
  }

  private subscriptions: Subscription[] = [];

  constructor(
    private documentoService: DocumentoService,
    private notificacionService: NotificacionService,
    private offlineService: OfflineService
  ) {}

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarDocumentos(): void {
    this.cargando = true;
    this.documentoService.getDocumentos().subscribe({
      next: (docs: Documento[]) => {
        this.documentos = docs.map(doc => ({
          ...doc,
          fechaSubida: new Date(doc.fechaSubida)
        }));
        this.filterDocuments();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error cargando documentos', err);
        this.notificacionService.mostrarError('No se pudieron cargar los documentos');
        this.cargando = false;
      }
    });
  }

  filterDocuments(): void {
    let filtered = this.documentos;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.titulo.toLowerCase().includes(term) ||
        doc.autor.toLowerCase().includes(term) ||
        (doc.descripcion && doc.descripcion.toLowerCase().includes(term))
      );
    }

    if (this.filtroTipo) {
      filtered = filtered.filter(doc => doc.tipo === this.filtroTipo);
    }

    this.filteredDocuments = filtered;
    this.ordenarDocumentos();
  }

  ordenarDocumentos(): void {
    const docs = [...this.filteredDocuments];
    switch (this.ordenPor) {
      case 'fechaDesc':
        docs.sort((a, b) => b.fechaSubida.getTime() - a.fechaSubida.getTime());
        break;
      case 'fechaAsc':
        docs.sort((a, b) => a.fechaSubida.getTime() - b.fechaSubida.getTime());
        break;
      case 'tituloAsc':
        docs.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'tituloDesc':
        docs.sort((a, b) => b.titulo.localeCompare(a.titulo));
        break;
      case 'tamanoDesc':
        docs.sort((a, b) => b.tamano - a.tamano);
        break;
      case 'tamanoAsc':
        docs.sort((a, b) => a.tamano - b.tamano);
        break;
    }
    this.filteredDocuments = docs;
  }

  getFileIcon(tipo: string): string {
    const icons: Record<string, string> = {
      pdf: '📄',
      word: '📝',
      excel: '📊',
      imagen: '🖼️',
      video: '🎥',
      otro: '📁'
    };
    return icons[tipo] || '📁';
  }

  cambiarVista(): void {
    this.vista = this.vista === 'grid' ? 'lista' : 'grid';
  }

  seleccionarDocumento(doc: Documento): void {
    this.documentoSeleccionado = doc;
  }

  cerrarVisor(): void {
    this.documentoSeleccionado = null;
  }

  abrirModalSubida(): void {
    this.modoEdicion = false;
    this.formData = { titulo: '', descripcion: '', tipo: 'pdf' };
    this.archivoSeleccionado = null;
    this.modalSubidaVisible = true;
  }

  editarDocumento(doc: Documento, event: MouseEvent): void {
    event.stopPropagation();
    this.modoEdicion = true;
    this.formData = { ...doc };
    this.archivoSeleccionado = null;
    this.modalSubidaVisible = true;
  }

  cerrarModalSubida(): void {
    this.modalSubidaVisible = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  guardarDocumento(): void {
    if (!this.formData.titulo) {
      this.notificacionService.mostrarAdvertencia('El título es obligatorio');
      return;
    }

    if (this.modoEdicion && this.formData.id) {
      // Verificar que el ID existe antes de actualizar
      this.documentoService.actualizarDocumento(this.formData.id, this.formData).subscribe({
        next: (docActualizado: Documento | undefined) => {
          if (docActualizado) {
            const index = this.documentos.findIndex(d => d.id === docActualizado.id);
            if (index !== -1) this.documentos[index] = docActualizado;
            this.filterDocuments();
            this.notificacionService.mostrarExito('Documento actualizado correctamente');
            this.cerrarModalSubida();
          }
        },
        error: (err: any) => {
          console.error('Error actualizando', err);
          this.notificacionService.mostrarError('Error al actualizar el documento');
        }
      });
    } else {
      if (!this.archivoSeleccionado) {
        this.notificacionService.mostrarAdvertencia('Debes seleccionar un archivo');
        return;
      }
      this.documentoService.subirDocumento(this.formData, this.archivoSeleccionado).subscribe({
        next: (nuevoDoc: Documento) => {
          this.documentos.push({ ...nuevoDoc, fechaSubida: new Date(nuevoDoc.fechaSubida) });
          this.filterDocuments();
          this.notificacionService.mostrarExito('Documento subido correctamente');
          this.cerrarModalSubida();
        },
        error: (err: any) => {
          console.error('Error subiendo', err);
          this.notificacionService.mostrarError('Error al subir el documento');
        }
      });
    }
  }

  confirmarEliminar(doc: Documento, event: MouseEvent): void {
    event.stopPropagation();
    this.documentoAEliminar = doc;
    this.modalEliminarVisible = true;
  }

  cancelarEliminacion(): void {
    this.modalEliminarVisible = false;
    this.documentoAEliminar = null;
  }

  eliminarDocumento(): void {
    if (!this.documentoAEliminar) return;
    // Verificar que el ID existe antes de eliminar
    if (!this.documentoAEliminar.id) {
      this.notificacionService.mostrarError('No se puede eliminar el documento: ID no válido');
      this.cancelarEliminacion();
      return;
    }
    this.documentoService.eliminarDocumento(this.documentoAEliminar.id).subscribe({
      next: () => {
        this.documentos = this.documentos.filter(d => d.id !== this.documentoAEliminar!.id);
        this.filterDocuments();
        this.notificacionService.mostrarExito('Documento eliminado correctamente');
        this.cancelarEliminacion();
      },
      error: (err: any) => {
        console.error('Error eliminando', err);
        this.notificacionService.mostrarError('Error al eliminar el documento');
        this.cancelarEliminacion();
      }
    });
  }

  descargarDocumento(doc: Documento, event: MouseEvent): void {
    event.stopPropagation();
    if (doc.archivoUrl) {
      const link = document.createElement('a');
      link.href = doc.archivoUrl;
      link.download = doc.titulo + this.getExtensionFromUrl(doc.archivoUrl);
      link.click();
    } else {
      this.notificacionService.mostrarAdvertencia('URL de descarga no disponible');
    }
  }

  private getExtensionFromUrl(url: string): string {
    const match = url.match(/\.[0-9a-z]+$/i);
    return match ? match[0] : '';
  }
}