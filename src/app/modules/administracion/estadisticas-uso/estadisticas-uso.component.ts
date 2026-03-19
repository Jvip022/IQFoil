import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { AdminService } from '../../../core/services/admin.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-estadisticas-uso',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './estadisticas-uso.component.html',
  styleUrls: ['./estadisticas-uso.component.scss']
})
export class EstadisticasUsoComponent implements OnInit {
  periodoSeleccionado = 'semana';
  cargando = false;

  stats = {
    usuariosTotales: 0,
    trendUsuarios: 0,
    usuariosActivos: 0,
    porcentajeActivos: 0,
    documentos: 0,
    videos: 0,
    evaluaciones: 0,
    horasNavegacion: 0,
    usuariosPorRol: [] as { rol: string; cantidad: number; porcentaje: number; color: string }[],
    contenidoPorTipo: [] as { tipo: string; cantidad: number; porcentaje: number; color: string }[],
    actividadReciente: [] as { icono: string; descripcion: string; fecha: Date }[],
    topUsuarios: [] as { nombre: string; actividad: number }[]
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private adminService: AdminService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarEstadisticas(): void {
    this.cargando = true;

    // Simular carga de datos
    setTimeout(() => {
      this.stats = {
        usuariosTotales: 1250,
        trendUsuarios: 12,
        usuariosActivos: 847,
        porcentajeActivos: 68,
        documentos: 342,
        videos: 189,
        evaluaciones: 5678,
        horasNavegacion: 2340,
        usuariosPorRol: [
          { rol: 'Atletas', cantidad: 850, porcentaje: 68, color: '#4aa3c2' },
          { rol: 'Entrenadores', cantidad: 250, porcentaje: 20, color: '#1a2b4c' },
          { rol: 'Administradores', cantidad: 150, porcentaje: 12, color: '#f39c12' }
        ],
        contenidoPorTipo: [
          { tipo: 'PDF', cantidad: 210, porcentaje: 61, color: '#4aa3c2' },
          { tipo: 'Video', cantidad: 120, porcentaje: 35, color: '#1a2b4c' },
          { tipo: 'Otros', cantidad: 12, porcentaje: 4, color: '#f39c12' }
        ],
        actividadReciente: [
          { icono: '👤', descripcion: 'Nuevo usuario registrado: Juan Pérez', fecha: new Date(Date.now() - 2 * 3600000) },
          { icono: '📄', descripcion: 'Documento "Reglamento 2025" subido', fecha: new Date(Date.now() - 5 * 3600000) },
          { icono: '📝', descripcion: 'Evaluación completada por Ana García', fecha: new Date(Date.now() - 1 * 24 * 3600000) },
          { icono: '🎥', descripcion: 'Nuevo video: "Técnicas de foils"', fecha: new Date(Date.now() - 2 * 24 * 3600000) }
        ],
        topUsuarios: [
          { nombre: 'Carlos López', actividad: 342 },
          { nombre: 'María García', actividad: 298 },
          { nombre: 'Juan Pérez', actividad: 256 },
          { nombre: 'Ana Martínez', actividad: 210 }
        ]
      };
      this.cargando = false;
      this.notificacionService.mostrarExito('Estadísticas actualizadas');
    }, 600);
  }
}