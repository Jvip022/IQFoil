import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';

// Componentes compartidos
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

// Pipe de seguridad (opcional, si ya existe en shared)
import { SafeUrlPipe } from '../../../shared/biblioteca-offline/biblioteca-offline.component';

@Component({
  selector: 'app-visor-pdf',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PdfViewerModule,
    LoadingSpinnerComponent,
    //SafeUrlPipe
  ],
  templateUrl: './visor-pdf.component.html',
  styleUrls: ['./visor-pdf.component.scss']
})
export class VisorPdfComponent implements OnInit, OnChanges {
  @Input() pdfSrc: string | ArrayBuffer | Uint8Array | null = null; // URL o datos del PDF
  @Input() filename = 'documento.pdf';
  @Input() initialPage = 1;
  @Input() initialZoom = 1.0;

  @ViewChild('pdfViewer') pdfViewer!: ElementRef;

  paginaActual = 1;
  totalPaginas = 0;
  zoom = 1.0;
  rotacion = 0;
  cargando = false;
  error: string | null = null;

  // Para el enlace de abrir en nueva pestaña
  get pdfUrl(): string | null {
    if (typeof this.pdfSrc === 'string') {
      return this.pdfSrc;
    }
    return null;
  }

  // Datos para el visor: convertir ArrayBuffer a Uint8Array si es necesario
  get pdfData(): string | Uint8Array | null {
    if (this.pdfSrc instanceof ArrayBuffer) {
      return new Uint8Array(this.pdfSrc);
    }
    if (this.pdfSrc instanceof Uint8Array) {
      return this.pdfSrc;
    }
    if (typeof this.pdfSrc === 'string') {
      return this.pdfSrc;
    }
    return null;
  }

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.paginaActual = this.initialPage;
    this.zoom = this.initialZoom;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pdfSrc'] && !changes['pdfSrc'].firstChange) {
      this.resetViewer();
    }
  }

  resetViewer(): void {
    this.paginaActual = 1;
    this.totalPaginas = 0;
    this.zoom = this.initialZoom;
    this.rotacion = 0;
    this.error = null;
  }

  cargado(pdf: any): void {
    this.totalPaginas = pdf.numPages;
    this.cargando = false;
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  zoomIn(): void {
    if (this.zoom < 2.5) this.zoom += 0.1;
  }

  zoomOut(): void {
    if (this.zoom > 0.5) this.zoom -= 0.1;
  }

  zoomFit(): void {
    this.zoom = 1.0;
  }

  rotar(): void {
    this.rotacion = (this.rotacion + 90) % 360;
  }

  descargar(): void {
    if (typeof this.pdfSrc === 'string') {
      const link = document.createElement('a');
      link.href = this.pdfSrc;
      link.download = this.filename;
      link.click();
      this.notificacionService.mostrarExito('Descarga iniciada');
    } else {
      this.notificacionService.mostrarAdvertencia('No se puede descargar este PDF');
    }
  }

  imprimir(): void {
    if (typeof this.pdfSrc === 'string') {
      const win = window.open(this.pdfSrc, '_blank');
      if (win) {
        win.print();
      }
    } else {
      this.notificacionService.mostrarAdvertencia('No se puede imprimir este PDF');
    }
  }

  reintentar(): void {
    this.error = null;
    const src = this.pdfSrc;
    this.pdfSrc = null;
    setTimeout(() => {
      this.pdfSrc = src;
    }, 100);
  }
}