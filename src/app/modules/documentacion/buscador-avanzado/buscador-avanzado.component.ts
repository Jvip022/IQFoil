import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { DocumentoService, Documento } from '../../../core/services/documento.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

// Pipes
import { SafeUrlPipe } from '../../../shared/biblioteca-offline/biblioteca-offline.component';

export interface FiltrosBusqueda {
  titulo: string;
  autor: string;
  tipo: string;
  fechaInicio: string | null;
  fechaFin: string | null;
}

@Component({
  selector: 'app-buscador-avanzado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent,
    SafeUrlPipe
  ],
  templateUrl: './buscador-avanzado.component.html',
  styleUrls: ['./buscador-avanzado.component.scss']
})
export class BuscadorAvanzadoComponent implements OnInit, OnDestroy {
  buscando = false;
  busquedaRealizada = false;
  resultados: Documento[] = [];
  todosLosDocumentos: Documento[] = [];

  filtros: FiltrosBusqueda = {
    titulo: '',
    autor: '',
    tipo: '',
    fechaInicio: null,
    fechaFin: null
  };

  ordenPor = 'relevancia';
  documentoSeleccionado: Documento | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private documentoService: DocumentoService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarDocumentos(): void {
    this.documentoService.getDocumentos().subscribe({
      next: (docs: Documento[]) => {
        this.todosLosDocumentos = docs;
      },
      error: (err: any) => {
        console.error('Error cargando documentos', err);
        this.notificacionService.mostrarError('No se pudieron cargar los documentos para la búsqueda');
      }
    });
  }

  buscar(): void {
    this.buscando = true;
    this.busquedaRealizada = true;

    setTimeout(() => {
      this.resultados = this.todosLosDocumentos.filter(doc => this.cumpleFiltros(doc));
      this.ordenarResultados();
      this.buscando = false;

      if (this.resultados.length === 0) {
        this.notificacionService.mostrarInfo('No se encontraron documentos con esos criterios');
      }
    }, 500);
  }

  cumpleFiltros(doc: Documento): boolean {
    if (this.filtros.titulo && !doc.titulo.toLowerCase().includes(this.filtros.titulo.toLowerCase())) {
      return false;
    }
    if (this.filtros.autor && !doc.autor.toLowerCase().includes(this.filtros.autor.toLowerCase())) {
      return false;
    }
    if (this.filtros.tipo && doc.tipo !== this.filtros.tipo) {
      return false;
    }
    if (this.filtros.fechaInicio) {
      const fechaInicio = new Date(this.filtros.fechaInicio);
      fechaInicio.setHours(0, 0, 0, 0);
      if (doc.fechaSubida < fechaInicio) {
        return false;
      }
    }
    if (this.filtros.fechaFin) {
      const fechaFin = new Date(this.filtros.fechaFin);
      fechaFin.setHours(23, 59, 59, 999);
      if (doc.fechaSubida > fechaFin) {
        return false;
      }
    }
    return true;
  }

  limpiarFiltros(): void {
    this.filtros = {
      titulo: '',
      autor: '',
      tipo: '',
      fechaInicio: null,
      fechaFin: null
    };
    this.busquedaRealizada = false;
    this.resultados = [];
  }

  ordenarResultados(): void {
    const docs = [...this.resultados];
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
      default:
        break;
    }
    this.resultados = docs;
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

  verDocumento(doc: Documento): void {
    this.documentoSeleccionado = doc;
  }

  cerrarVisor(): void {
    this.documentoSeleccionado = null;
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