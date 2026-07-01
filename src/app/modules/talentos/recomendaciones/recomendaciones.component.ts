import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { TalentoService, Recomendacion } from '../../../core/services/talento.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

@Component({
  selector: 'app-recomendaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './recomendaciones.component.html',
  styleUrls: ['./recomendaciones.component.scss']
})
export class RecomendacionesComponent implements OnInit, OnDestroy {
  cargando = false;
  recomendaciones: Recomendacion[] = [];
  filtroTipo: 'todos' | 'curso' | 'mentoria' | 'evento' = 'todos';

  // Modal de confirmación
  modalVisible = false;
  recomendacionSeleccionada: Recomendacion | null = null;
  modalMensaje = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private talentoService: TalentoService,
    private notificacionService: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarRecomendaciones();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get recomendacionesFiltradas(): Recomendacion[] {
    if (this.filtroTipo === 'todos') {
      return this.recomendaciones;
    }
    return this.recomendaciones.filter(r => r.tipo === this.filtroTipo);
  }

  // ============================================================
  // CARGAR RECOMENDACIONES (con usuario real o mock)
  // ============================================================
  cargarRecomendaciones(): void {
    this.cargando = true;

    // Obtener el usuario autenticado
    this.authService.getUser().subscribe({
      next: (user) => {
        const usuarioId = user?.uid || 'default-user';
        this.talentoService.getRecomendaciones(usuarioId).subscribe({
          next: (recomendaciones) => {
            this.recomendaciones = recomendaciones;
            this.cargando = false;
          },
          error: (err) => {
            console.error('Error cargando recomendaciones', err);
            this.notificacionService.mostrarError('No se pudieron cargar las recomendaciones');
            this.cargando = false;
          }
        });
      },
      error: () => {
        // Fallback: usar usuario por defecto si no se puede obtener
        this.talentoService.getRecomendaciones('default-user').subscribe({
          next: (recomendaciones) => {
            this.recomendaciones = recomendaciones;
            this.cargando = false;
          },
          error: (err) => {
            console.error('Error cargando recomendaciones (fallback)', err);
            this.notificacionService.mostrarError('Error al cargar recomendaciones');
            this.cargando = false;
          }
        });
      }
    });
  }

  // ============================================================
  // REFRESCAR
  // ============================================================
  refrescarRecomendaciones(): void {
    this.notificacionService.mostrarInfo('Actualizando recomendaciones...');
    this.cargarRecomendaciones();
  }

  // ============================================================
  // OBTENER TEXTO DEL TIPO
  // ============================================================
  getTipoTexto(tipo: string): string {
    const textos: Record<string, string> = {
      curso: 'Curso',
      mentoria: 'Mentoría',
      evento: 'Evento'
    };
    return textos[tipo] || 'Recomendación';
  }

  // ============================================================
  // INTERÉS EN RECOMENDACIÓN
  // ============================================================
  interesado(recomendacion: Recomendacion): void {
    this.recomendacionSeleccionada = recomendacion;
    this.modalMensaje = `¿Estás interesado en "${recomendacion.titulo}"? Te notificaremos cuando haya más información.`;
    this.modalVisible = true;
  }

  confirmarInteres(): void {
    if (this.recomendacionSeleccionada) {
      // Aquí se podría llamar a un servicio para registrar el interés
      console.log('Interés registrado para:', this.recomendacionSeleccionada);
      this.notificacionService.mostrarExito('¡Interés registrado! Te mantendremos informado.');
    }
    this.modalVisible = false;
    this.recomendacionSeleccionada = null;
  }

  cancelarInteres(): void {
    this.modalVisible = false;
    this.recomendacionSeleccionada = null;
  }
}