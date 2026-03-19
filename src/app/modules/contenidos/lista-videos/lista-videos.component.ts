import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { ContenidoService, Video, Modulo } from '../../../core/services/contenido.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

// Pipe de duración (archivo separado)
import { DuracionPipe } from './duracion.pipe';

@Component({
  selector: 'app-lista-videos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent,
    DuracionPipe
  ],
  templateUrl: './lista-videos.component.html',
  styleUrls: ['./lista-videos.component.scss']
})
export class ListaVideosComponent implements OnInit, OnDestroy {
  cargando = false;
  videos: Video[] = [];
  videosFiltrados: Video[] = [];
  modulos: Modulo[] = [];

  searchTerm = '';
  filtroNivel = '';
  ordenPor = 'fechaDesc';

  videoSeleccionado: Video | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private contenidoService: ContenidoService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarVideos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarVideos(): void {
    this.cargando = true;
    this.contenidoService.getModulos().subscribe({
      next: (modulos) => {
        this.modulos = modulos;
        this.videos = modulos.flatMap(m => m.videos);
        this.filtrarVideos();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando videos', err);
        this.notificacionService.mostrarError('No se pudieron cargar los videos');
        this.cargando = false;
      }
    });
  }

  filtrarVideos(): void {
    let filtrados = this.videos;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(v => v.titulo.toLowerCase().includes(term));
    }

    if (this.filtroNivel) {
      filtrados = filtrados.filter(v => v.nivel === this.filtroNivel);
    }

    this.videosFiltrados = filtrados;
    this.ordenarVideos();
  }

  ordenarVideos(): void {
    const ordenados = [...this.videosFiltrados];
    switch (this.ordenPor) {
      case 'fechaDesc':
        ordenados.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'fechaAsc':
        ordenados.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'tituloAsc':
        ordenados.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'tituloDesc':
        ordenados.sort((a, b) => b.titulo.localeCompare(a.titulo));
        break;
    }
    this.videosFiltrados = ordenados;
  }

  verVideo(video: Video): void {
    this.videoSeleccionado = video;
  }

  cerrarDetalle(): void {
    this.videoSeleccionado = null;
  }

  marcarComoVisto(video: Video, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    const modulo = this.modulos.find(m => m.videos.some(v => v.id === video.id));
    if (!modulo) {
      this.notificacionService.mostrarError('No se encontró el módulo del video');
      return;
    }
    this.contenidoService.marcarVideoComoVisto(modulo.id, video.id).subscribe({
      next: () => {
        video.progreso = 100;
        video.completado = true;
        this.notificacionService.mostrarExito('Video marcado como visto');
      },
      error: (err) => {
        console.error('Error marcando video', err);
        this.notificacionService.mostrarError('Error al marcar el video');
      }
    });
  }
}