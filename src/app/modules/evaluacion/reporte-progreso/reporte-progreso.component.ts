import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';
import { ContenidoService, Modulo } from '../../../core/services/contenido.service';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { ReportesService, ProgresoIndividual } from '../../../core/services/reportes.service';
import { AuthService } from '../../../core/services/auth.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

// Librerías para exportar
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ProgresoData {
  modulosCompletados: number;
  totalModulos: number;
  videosVistos: number;
  totalVideos: number;
  evaluacionesRealizadas: number;
  puntuacionMedia: number;
  modulos: { nombre: string; progreso: number; color: string }[];
  evolucion: { mes: string; puntuacion: number }[];
  actividadReciente: { icono: string; descripcion: string; fecha: Date }[];
}

@Component({
  selector: 'app-reporte-progreso',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './reporte-progreso.component.html',
  styleUrls: ['./reporte-progreso.component.scss']
})
export class ReporteProgresoComponent implements OnInit, OnDestroy {
  @ViewChild('reporteContent') reporteContent!: ElementRef;

  cargando = false;
  exportando = false;

  progreso: ProgresoData = {
    modulosCompletados: 0,
    totalModulos: 0,
    videosVistos: 0,
    totalVideos: 0,
    evaluacionesRealizadas: 0,
    puntuacionMedia: 0,
    modulos: [],
    evolucion: [],
    actividadReciente: []
  };

  coloresEvolucion = ['#4aa3c2', '#1a2b4c', '#f39c12', '#61708b', '#d94e4e'];

  private subscriptions: Subscription[] = [];

  constructor(
    private notificacionService: NotificacionService,
    private contenidoService: ContenidoService,
    private evaluacionService: EvaluacionService,
    private reportesService: ReportesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarDatos(): void {
    this.cargando = true;
    this.authService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        if (!user || !user.uid) {
          this.notificacionService.mostrarError('Usuario no autenticado');
          this.cargando = false;
          return;
        }
        this.obtenerDatos(parseInt(user.uid));
      },
      error: () => {
        this.notificacionService.mostrarError('Error al obtener usuario');
        this.cargando = false;
      }
    });
  }

  private obtenerDatos(usuarioId: number): void {
    forkJoin({
      progresoIndividual: this.reportesService.getProgresoIndividual(usuarioId).pipe(take(1)),
      modulos: this.contenidoService.getModulos().pipe(take(1))
    }).subscribe({
      next: ({ progresoIndividual, modulos }) => {
        this.procesarDatos(progresoIndividual, modulos);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.notificacionService.mostrarError('No se pudieron cargar los datos');
        this.cargando = false;
      }
    });
  }

  private procesarDatos(pi: ProgresoIndividual, modulos: Modulo[]): void {
    // KPI principales
    this.progreso.videosVistos = pi.videos_vistos;
    this.progreso.totalVideos = pi.total_videos;
    this.progreso.evaluacionesRealizadas = pi.evaluaciones_realizadas;
    this.progreso.puntuacionMedia = pi.nota_promedio;
    this.progreso.totalModulos = modulos.length;
    this.progreso.modulosCompletados = modulos.filter(m => m.completado).length;

    // Módulos con progreso
    this.progreso.modulos = modulos.map((m, index) => {
      const progresoModulo = m.progreso ?? 0;
      const colores = ['#4aa3c2', '#1a2b4c', '#f39c12', '#61708b', '#d94e4e', '#7cb342', '#e67e22', '#8e44ad'];
      return {
        nombre: m.titulo,
        progreso: progresoModulo,
        color: colores[index % colores.length]
      };
    });

    // Evolución de puntuaciones
    if (pi.evolucion && pi.evolucion.length > 0) {
      this.progreso.evolucion = pi.evolucion.map(e => ({
        mes: e.mes,
        puntuacion: e.puntuacion_promedio || 0
      }));
    } else {
      this.progreso.evolucion = [
        { mes: 'Ene', puntuacion: 0 },
        { mes: 'Feb', puntuacion: 0 },
        { mes: 'Mar', puntuacion: 0 },
        { mes: 'Abr', puntuacion: 0 },
        { mes: 'May', puntuacion: 0 },
        { mes: 'Jun', puntuacion: 0 }
      ];
    }

    // Actividad reciente (mock, pero mejorable)
    this.progreso.actividadReciente = [
      { icono: '📝', descripcion: 'Evaluación completada', fecha: new Date() },
      { icono: '🎥', descripcion: `Video visto: ${pi.videos_vistos} de ${pi.total_videos}`, fecha: new Date() },
      { icono: '🏆', descripcion: `Progreso global: ${pi.progreso_global}%`, fecha: new Date() }
    ];
  }

  // ========== EXPORTAR PDF ==========
  exportarReporte(): void {
    if (this.exportando) return;
    this.exportando = true;
    this.notificacionService.mostrarInfo('Generando PDF...');

    const content = this.reporteContent.nativeElement;
    if (!content) {
      this.notificacionService.mostrarError('No hay contenido para exportar');
      this.exportando = false;
      return;
    }

    const fecha = new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // Clonar y forzar fondo blanco
    const clon = content.cloneNode(true) as HTMLElement;
    clon.style.backgroundColor = '#ffffff';
    clon.style.color = '#000000';
    clon.style.padding = '20px';
    const cards = clon.querySelectorAll('.kpi-card, .chart-card, .actividad-card');
    cards.forEach(c => {
      (c as HTMLElement).style.backgroundColor = '#ffffff';
      (c as HTMLElement).style.border = '1px solid #cccccc';
    });
    const barras = clon.querySelectorAll('.barra-bg');
    barras.forEach(b => {
      (b as HTMLElement).style.backgroundColor = '#e9ecef';
    });

    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.backgroundColor = '#ffffff';
    wrapper.appendChild(clon);
    document.body.appendChild(wrapper);

    html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: 1200
    }).then((canvas) => {
      document.body.removeChild(wrapper);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFontSize(18);
      pdf.setTextColor(0, 60, 120);
      pdf.text('Reporte de Progreso', pdfWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.setTextColor(40);
      pdf.text('Federación Cubana de Vela', pdfWidth / 2, 30, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Fecha: ${fecha}`, pdfWidth - 20, 40, { align: 'right' });
      pdf.setDrawColor(0, 60, 120);
      pdf.line(20, 45, pdfWidth - 20, 45);

      pdf.addImage(imgData, 'PNG', 0, 50, pdfWidth, pdfHeight - 50);
      pdf.save('reporte_progreso.pdf');
      this.exportando = false;
      this.notificacionService.mostrarExito('PDF descargado correctamente');
    }).catch((error) => {
      document.body.removeChild(wrapper);
      console.error('Error al generar PDF:', error);
      this.notificacionService.mostrarError('Error al generar el PDF');
      this.exportando = false;
    });
  }
}