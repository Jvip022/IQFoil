import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { TalentoService, MetricasTalento } from '../../../core/services/talento.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-panel-metricas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './panel-metricas.component.html',
  styleUrls: ['./panel-metricas.component.scss']
})
export class PanelMetricasComponent implements OnInit, OnDestroy {
  cargando = false;
  periodoSeleccionado = 'mes';

  metricas: MetricasTalento = {
    progresoGeneral: 0,
    insigniasObtenidas: 0,
    totalInsignias: 10,
    horasNavegacion: 0,
    trendHoras: 0,
    evaluacionesRealizadas: 0,
    evaluacionesPendientes: 0,
    alertasActivas: 0,
    puntuacionMedia: 0,
    progresoCategoria: [],
    evolucionMensual: [],
    ultimasActividades: []
  };

  coloresEvolucion = ['#4aa3c2', '#1a2b4c', '#f39c12', '#61708b', '#d94e4e', '#7cb342'];

  private subscriptions: Subscription[] = [];

  constructor(
    private talentoService: TalentoService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarMetricas();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ============================================================
  // CARGAR MÉTRICAS (desde backend o mock)
  // ============================================================
  cargarMetricas(): void {
    this.cargando = true;
    
    this.talentoService.getMetricas(this.periodoSeleccionado).subscribe({
      next: (datos) => {
        this.metricas = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando métricas', err);
        this.notificacionService.mostrarError('No se pudieron cargar las métricas. Usando datos de prueba.');
        this.cargando = false;
      }
    });
  }

  // ============================================================
  // REFRESCAR MÉTRICAS (nuevo método)
  // ============================================================
  refrescarMetricas(): void {
    this.notificacionService.mostrarInfo('Actualizando métricas...');
    this.cargarMetricas();
  }

  // ============================================================
  // CAMBIAR PERÍODO
  // ============================================================
  cambiarPeriodo(): void {
    const nombres: Record<string, string> = {
      'semana': 'última semana',
      'mes': 'último mes',
      'trimestre': 'último trimestre',
      'año': 'último año',
      'todo': 'todo el historial'
    };
    this.notificacionService.mostrarInfo(`Cargando métricas para ${nombres[this.periodoSeleccionado] || this.periodoSeleccionado}...`);
    this.cargarMetricas();
  }

  // ============================================================
  // MÉTODO AUXILIAR PARA EL TEMPLATE (si se necesita)
  // ============================================================
  trackByIndex(index: number, item: any): number {
    return index;
  }
}