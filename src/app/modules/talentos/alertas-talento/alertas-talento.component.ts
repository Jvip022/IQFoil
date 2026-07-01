import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { TalentoService, AlertaTalento } from '../../../core/services/talento.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

@Component({
  selector: 'app-alertas-talento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './alertas-talento.component.html',
  styleUrls: ['./alertas-talento.component.scss']
})
export class AlertasTalentoComponent implements OnInit, OnDestroy {
  alertas: AlertaTalento[] = [];
  cargando = false;

  // Modal de eliminación
  modalEliminarVisible = false;
  alertaAEliminar: AlertaTalento | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private talentoService: TalentoService,
    private notificacionService: NotificacionService,
    private authService: AuthService // Añadido para obtener usuario (opcional)
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ============================================================
  // COMPUTADAS
  // ============================================================
  get tieneNoLeidas(): boolean {
    return this.alertas.some(a => !a.leida);
  }

  get mensajeEliminar(): string {
    return this.alertaAEliminar
      ? `¿Estás seguro de que deseas eliminar esta alerta?`
      : '';
  }

  // ============================================================
  // CARGAR ALERTAS
  // ============================================================
  cargarAlertas(): void {
    this.cargando = true;
    this.talentoService.getAlertasNoLeidas().subscribe({
      next: (alertas) => {
        this.alertas = alertas;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando alertas', err);
        this.notificacionService.mostrarError('No se pudieron cargar las alertas');
        this.cargando = false;
      }
    });
  }

  // ============================================================
  // REFRESCAR (nuevo)
  // ============================================================
  refrescarAlertas(): void {
    this.notificacionService.mostrarInfo('Actualizando alertas...');
    this.cargarAlertas();
  }

  // ============================================================
  // ICONOS Y TEXTOS
  // ============================================================
  getIcono(tipo: string): string {
    const iconos: Record<string, string> = {
      'nuevo-talento': '🌟',
      'logro-destacado': '🏆',
      'recomendacion': '💡'
    };
    return iconos[tipo] || '🔔';
  }

  getTipoTexto(tipo: string): string {
    const textos: Record<string, string> = {
      'nuevo-talento': 'Nuevo talento',
      'logro-destacado': 'Logro destacado',
      'recomendacion': 'Recomendación'
    };
    return textos[tipo] || 'Alerta';
  }

  // ============================================================
  // MARCAR COMO LEÍDA
  // ============================================================
  marcarComoLeida(alerta: AlertaTalento): void {
    if (alerta.leida) return;

    this.talentoService.marcarAlertaComoLeida(alerta.id).subscribe({
      next: () => {
        alerta.leida = true;
        this.notificacionService.mostrarExito('Alerta marcada como leída');
      },
      error: (err) => {
        console.error('Error marcando alerta', err);
        this.notificacionService.mostrarError('Error al marcar la alerta');
      }
    });
  }

  // ============================================================
  // MARCAR TODAS COMO LEÍDAS
  // ============================================================
  marcarTodasLeidas(): void {
    const idsNoLeidas = this.alertas.filter(a => !a.leida).map(a => a.id);
    if (idsNoLeidas.length === 0) return;

    let completadas = 0;
    idsNoLeidas.forEach(id => {
      this.talentoService.marcarAlertaComoLeida(id).subscribe({
        next: () => {
          completadas++;
          const alerta = this.alertas.find(a => a.id === id);
          if (alerta) alerta.leida = true;
          if (completadas === idsNoLeidas.length) {
            this.notificacionService.mostrarExito('Todas las alertas fueron marcadas como leídas');
          }
        },
        error: (err) => {
          console.error('Error marcando alerta', err);
        }
      });
    });
  }

  // ============================================================
  // ELIMINAR ALERTA
  // ============================================================
  confirmarEliminar(alerta: AlertaTalento, event: MouseEvent): void {
    event.stopPropagation();
    this.alertaAEliminar = alerta;
    this.modalEliminarVisible = true;
  }

  cancelarEliminacion(): void {
    this.modalEliminarVisible = false;
    this.alertaAEliminar = null;
  }

  eliminarAlerta(): void {
    if (!this.alertaAEliminar) return;

    // Simulación de eliminación (en un caso real se llamaría al servicio)
    this.alertas = this.alertas.filter(a => a.id !== this.alertaAEliminar!.id);
    this.notificacionService.mostrarExito('Alerta eliminada');
    this.cancelarEliminacion();
  }
}