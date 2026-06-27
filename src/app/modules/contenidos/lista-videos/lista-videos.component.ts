import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';

import { ContenidoService, Video, Modulo } from '../../../core/services/contenido.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';
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
  ) { }

  ngOnInit(): void {
    this.cargarVideos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarVideos(): void {
    this.cargando = true;
    forkJoin({
      tutoriales: this.contenidoService.getModulos(),
      practicas: this.contenidoService.getVideosPractica()
    }).subscribe({
      next: ({ tutoriales, practicas }) => {
        // Extraer videos de los módulos y asignar tipo 'tutorial'
        const videosTutorial: Video[] = tutoriales.flatMap(m => m.videos).map(v => ({ ...v, tipo: 'tutorial' }));
        // Los videos de práctica ya vienen con tipo 'practica' desde el backend
        this.videos = [...videosTutorial, ...practicas];
        // También guardar los módulos originales para funcionalidades como marcar visto
        this.modulos = tutoriales;
        this.filtrarVideos();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando videos:', err);
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
        ordenados.sort((a, b) => {
          const idA = typeof a.id === 'number' ? a.id : parseInt(a.id, 10);
          const idB = typeof b.id === 'number' ? b.id : parseInt(b.id, 10);
          return idB - idA;
        });
        break;
      case 'fechaAsc':
        ordenados.sort((a, b) => {
          const idA = typeof a.id === 'number' ? a.id : parseInt(a.id, 10);
          const idB = typeof b.id === 'number' ? b.id : parseInt(b.id, 10);
          return idA - idB;
        });
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
    // Solo los tutoriales se pueden marcar como vistos (las prácticas no tienen progreso asociado)
    if (video.tipo === 'practica') {
      this.notificacionService.mostrarAdvertencia('Los videos de práctica no se pueden marcar como vistos');
      return;
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