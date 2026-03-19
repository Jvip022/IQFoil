import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { ContenidoService, Modulo } from '../../../core/services/contenido.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

// Pipe de duración
import { DuracionPipe } from '../lista-videos/duracion.pipe';

@Component({
  selector: 'app-progreso-modulo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent,
    DuracionPipe
  ],
  templateUrl: './progreso-modulo.component.html',
  styleUrls: ['./progreso-modulo.component.scss']
})
export class ProgresoModuloComponent implements OnInit, OnDestroy {
  modulos: (Modulo & { expandido?: boolean })[] = [];
  cargando = false;

  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalConfirmText = 'Aceptar';
  accionModal: { tipo: string; data?: any } | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private contenidoService: ContenidoService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarModulos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarModulos(): void {
    this.cargando = true;
    this.contenidoService.getModulos().subscribe({
      next: (modulos) => {
        this.modulos = modulos.map(m => ({
          ...m,
          expandido: false,
          progreso: m.videos.length
            ? Math.round(m.videos.reduce((acc, v) => acc + (v.progreso || 0), 0) / m.videos.length)
            : 0
        }));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando módulos', err);
        this.notificacionService.mostrarError('No se pudieron cargar los módulos');
        this.cargando = false;
      }
    });
  }

  refrescar(): void {
    this.cargarModulos();
  }

  toggleModulo(modulo: Modulo & { expandido?: boolean }): void {
    modulo.expandido = !modulo.expandido;
  }

  marcarVideoComoVisto(moduloId: string, video: any, event: MouseEvent): void {
    event.stopPropagation();
    this.contenidoService.marcarVideoComoVisto(moduloId, video.id).subscribe({
      next: () => {
        video.completado = true;
        video.progreso = 100;
        const modulo = this.modulos.find(m => m.id === moduloId);
        if (modulo) {
          modulo.completado = modulo.videos.every(v => v.completado);
          modulo.progreso = modulo.completado ? 100 : Math.round(
            modulo.videos.reduce((acc, v) => acc + (v.progreso || 0), 0) / modulo.videos.length
          );
        }
        this.notificacionService.mostrarExito('Video marcado como visto');
      },
      error: (err) => {
        console.error('Error marcando video', err);
        this.notificacionService.mostrarError('Error al marcar el video');
      }
    });
  }

  confirmarAccionModal(): void {
    if (this.accionModal) {
      this.notificacionService.mostrarExito('Acción confirmada');
    }
    this.modalVisible = false;
    this.accionModal = null;
  }

  cancelarModal(): void {
    this.modalVisible = false;
    this.accionModal = null;
  }
}