// src/app/shared/biblioteca-offline/biblioteca-offline.component.ts
import { Component, OnInit, OnDestroy, Pipe, PipeTransform, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { OfflineService, OfflineDocument } from '../../core/services/offline.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ModalConfirmacionComponent } from '../modal-confirmacion/modal-confirmacion.component'; // ← IMPORTACIÓN AÑADIDA

@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

@Pipe({ name: 'safeUrl', standalone: true })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string | undefined | null): SafeResourceUrl | string {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-biblioteca-offline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileSizePipe,
    SafeUrlPipe,
    ModalConfirmacionComponent // ← IMPORTADO
  ],
  templateUrl: './biblioteca-offline.component.html',
  styleUrls: ['./biblioteca-offline.component.scss']
})
export class BibliotecaOfflineComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('foilGlow') foilGlow!: ElementRef<HTMLDivElement>;

  isOnline = navigator.onLine;
  searchTerm = '';
  documents: OfflineDocument[] = [];
  filteredDocuments: OfflineDocument[] = [];
  selectedDoc: OfflineDocument | null = null;

  // ========== PROPIEDADES PARA EL MODAL DE ALERTA ==========
  modalAlertaVisible = false;
  modalAlertaTitulo = '';
  modalAlertaMensaje = '';
  modalAlertaConfirmText = 'Aceptar';

  private subscriptions: Subscription[] = [];
  private onNetworkChange = () => {
    this.isOnline = navigator.onLine;
  };
  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;

  constructor(
    private offlineService: OfflineService,
    private notificacionService: NotificacionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    window.addEventListener('online', this.onNetworkChange);
    window.addEventListener('offline', this.onNetworkChange);
  }

  ngAfterViewInit(): void {
    this.initGlowEffect();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    window.removeEventListener('online', this.onNetworkChange);
    window.removeEventListener('offline', this.onNetworkChange);
    if (this.mouseMoveHandler) {
      window.removeEventListener('mousemove', this.mouseMoveHandler);
    }
  }

  private initGlowEffect(): void {
    if (!this.foilGlow) return;

    this.mouseMoveHandler = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      if (this.foilGlow) {
        this.foilGlow.nativeElement.style.background = `radial-gradient(ellipse at ${x}% ${y}%, rgba(0, 212, 255, 0.2), transparent 70%)`;
      }
    };
    window.addEventListener('mousemove', this.mouseMoveHandler);
  }

  private loadDocuments(): void {
    this.offlineService.getOfflineDocuments().subscribe({
      next: (docs: OfflineDocument[]) => {
        this.documents = docs;
        this.filterDocuments();
      },
      error: (err: any) => {
        console.error('Error cargando documentos offline', err);
        this.mostrarAlerta('Error', 'No se pudieron cargar los documentos.');
      }
    });
  }

  filterDocuments(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDocuments = this.documents;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDocuments = this.documents.filter(doc =>
        doc.title.toLowerCase().includes(term)
      );
    }
  }

  getFileIcon(type: string): string {
    const icons: Record<string, string> = {
      pdf: '📄',
      image: '🖼️',
      text: '📝',
      video: '🎥'
    };
    return icons[type] || '📁';
  }

  openDocument(doc: OfflineDocument): void {
    if (!doc.url && !doc.content) {
      this.mostrarAlerta(
        'Contenido no disponible',
        'Este documento no tiene contenido almacenado offline. Conéctate para descargarlo.'
      );
      return;
    }
    this.selectedDoc = doc;
  }

  closeViewer(): void {
    this.selectedDoc = null;
  }

  downloadDocument(doc: OfflineDocument, event: MouseEvent): void {
    event.stopPropagation();

    if (!doc.url && !doc.content) {
      this.mostrarAlerta(
        'No se puede descargar',
        'Este documento no está disponible para descarga offline.'
      );
      return;
    }

    if (doc.url) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.title;
      link.click();
      this.notificacionService.mostrarExito(`Descargando "${doc.title}"...`);
    } else if (doc.content) {
      const blob = new Blob([doc.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.title + '.txt';
      link.click();
      window.URL.revokeObjectURL(url);
      this.notificacionService.mostrarExito(`Descargando "${doc.title}"...`);
    }
  }

  syncDocuments(): void {
    if (!this.isOnline) {
      this.mostrarAlerta(
        'Sin conexión',
        'No tienes conexión a internet. Conéctate para sincronizar los documentos.'
      );
      return;
    }

    this.notificacionService.mostrarInfo('Sincronizando documentos...');
    this.offlineService.syncOfflineDocuments().subscribe({
      next: (updatedDocs: OfflineDocument[]) => {
        this.documents = updatedDocs;
        this.filterDocuments();
        this.notificacionService.mostrarExito('Documentos sincronizados correctamente');
      },
      error: (err: any) => {
        console.error('Error sincronizando', err);
        this.mostrarAlerta('Error de sincronización', 'Ocurrió un error al sincronizar los documentos.');
      }
    });
  }

  // ========== MÉTODOS DEL MODAL DE ALERTA ==========
  private mostrarAlerta(titulo: string, mensaje: string): void {
    this.modalAlertaTitulo = titulo;
    this.modalAlertaMensaje = mensaje;
    this.modalAlertaConfirmText = 'Aceptar';
    this.modalAlertaVisible = true;
  }

  cerrarAlerta(): void {
    this.modalAlertaVisible = false;
  }

  // Método para pruebas
  addMockDocument(): void {
    const newDoc: OfflineDocument = {
      id: Date.now().toString(),
      title: 'Documento de prueba offline',
      type: 'text',
      content: 'Este es un documento de prueba guardado localmente.',
      size: 100,
      lastModified: new Date(),
      synced: false
    };
    this.offlineService.addOfflineDocument(newDoc);
    this.loadDocuments();
    this.notificacionService.mostrarExito('Documento añadido a la biblioteca offline');
  }
}