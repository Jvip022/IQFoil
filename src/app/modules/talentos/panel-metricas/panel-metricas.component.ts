import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { TalentoService } from '../../../core/services/talento.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { UsuarioService } from '../../../core/services/usuario.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

export interface MetricasTalento {
  progresoGeneral: number;
  insigniasObtenidas: number;
  totalInsignias: number;
  horasNavegacion: number;
  trendHoras: number; // porcentaje de cambio
  evaluacionesRealizadas: number;
  evaluacionesPendientes: number;
  alertasActivas: number;
  puntuacionMedia: number;
  progresoCategoria: { nombre: string; valor: number; color: string }[];
  evolucionMensual: { mes: string; valor: number }[];
  ultimasActividades: { icono: string; descripcion: string; fecha: Date }[];
}

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

  // Colores para la evolución mensual
  coloresEvolucion = ['#4aa3c2', '#1a2b4c', '#f39c12', '#61708b', '#d94e4e'];

  private subscriptions: Subscription[] = [];

  constructor(
    private talentoService: TalentoService,
    private notificacionService: NotificacionService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarMetricas();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarMetricas(): void {
    this.cargando = true;

    // Simulación de carga de métricas (en un caso real, se llamaría a servicios)
    setTimeout(() => {
      this.metricas = {
        progresoGeneral: 68,
        insigniasObtenidas: 7,
        totalInsignias: 10,
        horasNavegacion: 245,
        trendHoras: 12,
        evaluacionesRealizadas: 18,
        evaluacionesPendientes: 3,
        alertasActivas: 2,
        puntuacionMedia: 8.4,
        progresoCategoria: [
          { nombre: 'Técnica', valor: 75, color: '#4aa3c2' },
          { nombre: 'Reglamento', valor: 60, color: '#1a2b4c' },
          { nombre: 'Seguridad', valor: 90, color: '#f39c12' },
          { nombre: 'Física', valor: 45, color: '#61708b' },
          { nombre: 'Estrategia', valor: 70, color: '#d94e4e' }
        ],
        evolucionMensual: [
          { mes: 'Ene', valor: 45 },
          { mes: 'Feb', valor: 52 },
          { mes: 'Mar', valor: 58 },
          { mes: 'Abr', valor: 63 },
          { mes: 'May', valor: 70 },
          { mes: 'Jun', valor: 68 }
        ],
        ultimasActividades: [
          { icono: '🏆', descripcion: 'Insignia "Estratega" obtenida', fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { icono: '📝', descripcion: 'Evaluación de técnica completada', fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { icono: '⛵', descripcion: 'Navegación de 4 horas registrada', fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { icono: '🔔', descripcion: 'Nueva alerta: talento detectado', fecha: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) }
        ]
      };
      this.cargando = false;
    }, 800);
  }

  cambiarPeriodo(): void {
    this.notificacionService.mostrarInfo(`Cambiando período a: ${this.periodoSeleccionado}`);
    this.cargarMetricas(); // Recargar con nuevo período
  }
}