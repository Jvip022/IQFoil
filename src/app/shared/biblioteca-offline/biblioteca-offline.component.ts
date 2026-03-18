import { Component, OnInit, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

// Servicios
import { OfflineService, OfflineDocument } from '../../core/services/offline.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';

// Pipe para formatear tamaño de archivo
@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Pipe para sanitizar URLs
@Pipe({ name: 'safeUrl', standalone: true })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string): SafeResourceUrl {
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
    SafeUrlPipe
  ],
  templateUrl: './biblioteca-offline.component.html',
  styleUrls: ['./biblioteca-offline.component.scss']
})
export class BibliotecaOfflineComponent implements OnInit, OnDestroy {
  isOnline = navigator.onLine;
  searchTerm = '';
  documents: OfflineDocument[] = [];
  filteredDocuments: OfflineDocument[] = [];
  selectedDoc: OfflineDocument | null = null;

  private subscriptions: Subscription[] = [];
  private onNetworkChange = () => {
    this.isOnline = navigator.onLine;
  };

  constructor(
    private offlineService: OfflineService,
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    window.addEventListener('online', this.onNetworkChange);
    window.addEventListener('offline', this.onNetworkChange);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    window.removeEventListener('online', this.onNetworkChange);
    window.removeEventListener('offline', this.onNetworkChange);
  }

  private loadDocuments(): void {
    this.offlineService.getOfflineDocuments().subscribe({
      next: (docs: OfflineDocument[]) => {
        this.documents = docs;
        this.filterDocuments();
      },
      error: (err: any) => {
        console.error('Error cargando documentos offline', err);
        this.notificacionService.mostrarError('No se pudieron cargar los documentos');
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
    this.selectedDoc = doc;
  }

  closeViewer(): void {
    this.selectedDoc = null;
  }

  downloadDocument(doc: OfflineDocument, event: MouseEvent): void {
    event.stopPropagation();
    if (doc.url) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.title;
      link.click();
    } else if (doc.content) {
      const blob = new Blob([doc.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.title + '.txt';
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  syncDocuments(): void {
    if (!this.isOnline) {
      this.notificacionService.mostrarAdvertencia('No hay conexión a internet');
      return;
    }

    this.offlineService.syncOfflineDocuments().subscribe({
      next: (updatedDocs: OfflineDocument[]) => {
        this.documents = updatedDocs;
        this.filterDocuments();
        this.notificacionService.mostrarExito('Documentos sincronizados correctamente');
      },
      error: (err: any) => {
        console.error('Error sincronizando', err);
        this.notificacionService.mostrarError('Error al sincronizar documentos');
      }
    });
  }
}