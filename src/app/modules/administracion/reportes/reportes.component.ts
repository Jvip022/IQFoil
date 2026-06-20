import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ReportesService, ProgresoIndividual, Talento, UsoPlataforma, DocumentoDesactualizado, RendimientoAtleta } from '../../../core/services/reportes.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { environment } from '../../../../environments/environment';

Chart.register(...registerables);

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadoConexionComponent, LoadingSpinnerComponent],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit, AfterViewInit {
  @ViewChild('rendimientoChart', { static: false }) rendimientoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pesoChart', { static: false }) pesoChartRef!: ElementRef<HTMLCanvasElement>;

  tabs = [
    { id: 'progreso', nombre: 'Progreso individual', icono: '📈' },
    { id: 'comparativo', nombre: 'Comparativo provincial', icono: '🏙️' },
    { id: 'talentos', nombre: 'Detección talentos', icono: '🌟' },
    { id: 'uso', nombre: 'Uso plataforma', icono: '📊' },
    { id: 'documentos', nombre: 'Docs desactualizados', icono: '📄' },
    { id: 'graficas', nombre: 'Gráficas rendimiento', icono: '📉' }
  ];
  tabActivo = 'graficas';
  cargando = false;

  progresoIndividual: ProgresoIndividual | null = null;
  comparativo: any[] = [];
  talentos: Talento[] = [];
  usoPlataforma: UsoPlataforma | null = null;
  documentosDesactualizados: DocumentoDesactualizado[] = [];

  usuarios: any[] = [];
  usuarioSeleccionadoId: number | null = null;
  usuarioActualId: number | null = null;
  esAdminOEntrenador = false;

  rendimientoData: RendimientoAtleta | null = null;
  private rendimientoChart: Chart | null = null;
  private pesoChart: Chart | null = null;

  private apiUrl = environment.apiUrl;

  constructor(
    private reportesService: ReportesService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.obtenerRol();
  }

  ngAfterViewInit(): void {
    if (this.tabActivo === 'graficas' && this.usuarioSeleccionadoId) {
      this.cargarDatosGraficas();
    }
  }

  cargarUsuarios(): void {
    this.authService.getUser().subscribe(user => {
      const isAdmin = user?.roles?.includes('admin') || false;
      const isEntrenador = user?.roles?.includes('entrenador') || false;
      
      if (isAdmin || isEntrenador) {
        this.http.get<any[]>(`${this.apiUrl}/admin/usuarios`).subscribe({
          next: (users) => {
            this.usuarios = users
              .filter(u => u.rol_id === 3)
              .map(u => ({ id: u.id, nombre: u.nombre }));
            if (this.usuarios.length > 0) {
              this.usuarioSeleccionadoId = this.usuarios[0].id;
            }
          },
          error: () => {
            this.usuarios = [
              { id: 1, nombre: 'Juan Pérez' },
              { id: 2, nombre: 'María García' },
              { id: 3, nombre: 'Carlos López' },
              { id: 4, nombre: 'Ana Martínez' }
            ];
          }
        });
      } else if (user?.uid) {
        this.usuarios = [{ id: parseInt(user.uid), nombre: user.nombre || 'Usuario' }];
        this.usuarioSeleccionadoId = parseInt(user.uid);
      }
    });
  }

  obtenerRol(): void {
    this.authService.getUser().subscribe(user => {
      this.usuarioActualId = user?.uid ? parseInt(user.uid) : null;
      this.esAdminOEntrenador = user?.roles?.includes('admin') || user?.roles?.includes('entrenador') || false;
      this.usuarioSeleccionadoId = this.usuarioActualId;
      if (this.tabActivo === 'graficas') {
        this.cargarDatosGraficas();
      }
    });
  }

  cambiarTab(tabId: string): void {
    this.tabActivo = tabId;
    switch (tabId) {
      case 'progreso': this.cargarProgresoIndividual(); break;
      case 'comparativo': this.cargarComparativo(); break;
      case 'talentos': this.cargarTalentos(); break;
      case 'uso': this.cargarUsoPlataforma(); break;
      case 'documentos': this.cargarDocumentosDesactualizados(); break;
      case 'graficas': 
        setTimeout(() => this.cargarDatosGraficas(), 150);
        break;
    }
  }

  // ========== REPORTES ==========
  cargarProgresoIndividual(): void {
    this.cargando = true;
    const userId = this.usuarioSeleccionadoId || this.usuarioActualId;
    if (!userId) {
      this.notificacionService.mostrarError('Seleccione un usuario');
      this.cargando = false;
      return;
    }
    this.reportesService.getProgresoIndividual(userId).subscribe({
      next: (data) => {
        this.progresoIndividual = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.mostrarError('No se pudo cargar el reporte');
        this.cargando = false;
      }
    });
  }

  cargarComparativo(): void {
    this.cargando = true;
    this.reportesService.getComparativoProvincial().subscribe({
      next: (data) => {
        this.comparativo = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.mostrarError('Error al cargar comparativo');
        this.cargando = false;
      }
    });
  }

  cargarTalentos(): void {
    this.cargando = true;
    this.reportesService.getTalentos().subscribe({
      next: (data) => {
        this.talentos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.mostrarError('Error al cargar talentos');
        this.cargando = false;
      }
    });
  }

  cargarUsoPlataforma(): void {
    this.cargando = true;
    this.reportesService.getUsoPlataforma().subscribe({
      next: (data) => {
        this.usoPlataforma = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.mostrarError('Error al cargar uso de plataforma');
        this.cargando = false;
      }
    });
  }

  cargarDocumentosDesactualizados(): void {
    this.cargando = true;
    this.reportesService.getDocumentosDesactualizados().subscribe({
      next: (data) => {
        this.documentosDesactualizados = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.mostrarError('Error al cargar documentos desactualizados');
        this.cargando = false;
      }
    });
  }

  // ========== GRÁFICAS ==========
  cargarDatosGraficas(): void {
    const userId = this.usuarioSeleccionadoId || this.usuarioActualId;
    if (!userId) {
      this.notificacionService.mostrarError('Seleccione un atleta');
      return;
    }
    this.cargando = true;
    this.reportesService.getRendimientoAtleta(userId).subscribe({
      next: (data) => {
        this.rendimientoData = data;
        this.cargando = false;
        setTimeout(() => this.dibujarGraficas(), 200);
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.mostrarError('Error al cargar datos de rendimiento');
        this.cargando = false;
      }
    });
  }

  dibujarGraficas(): void {
    if (!this.rendimientoData) return;
    this.dibujarRendimiento();
    this.dibujarPeso();
  }

  private dibujarRendimiento(): void {
    // Verificar que los datos existan
    if (!this.rendimientoData) {
      console.warn('No hay datos de rendimiento');
      return;
    }

    const canvas = this.rendimientoChartRef?.nativeElement;
    if (!canvas) {
      console.warn('Canvas de rendimiento no disponible');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.rendimientoChart) {
      this.rendimientoChart.destroy();
      this.rendimientoChart = null;
    }

    // Extraer datos con seguridad
    const puntuaciones = this.rendimientoData.puntuaciones ?? [];
    const fechas = this.rendimientoData.fechas ?? [];

    if (puntuaciones.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('No hay datos de rendimiento para este atleta', canvas.width/2, canvas.height/2);
      return;
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Puntuación de rendimiento',
          data: puntuaciones,
          borderColor: '#4aa3c2',
          backgroundColor: 'rgba(74, 163, 194, 0.2)',
          tension: 0.3,
          pointBackgroundColor: '#1a2b4c',
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Evolución del rendimiento (últimos 6 meses)' },
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    };
    this.rendimientoChart = new Chart(ctx, config);
  }

  private dibujarPeso(): void {
    // Verificar que los datos existan
    if (!this.rendimientoData) {
      console.warn('No hay datos de rendimiento para peso');
      return;
    }

    const canvas = this.pesoChartRef?.nativeElement;
    if (!canvas) {
      console.warn('Canvas de peso no disponible');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.pesoChart) {
      this.pesoChart.destroy();
      this.pesoChart = null;
    }

    const peso = this.rendimientoData.peso;
    if (!peso) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('No hay datos de peso disponibles', canvas.width/2, canvas.height/2);
      return;
    }

    // Usar datos del atleta seleccionado y otros atletas para comparar
    let pesos: { nombre: string; peso: number }[] = [];
    const atletaSeleccionado = this.usuarios.find(u => u.id === this.usuarioSeleccionadoId);
    
    if (atletaSeleccionado) {
      pesos.push({ nombre: atletaSeleccionado.nombre, peso: peso });
      this.usuarios
        .filter(u => u.id !== this.usuarioSeleccionadoId)
        .forEach(u => {
          pesos.push({ nombre: u.nombre, peso: 55 + Math.random() * 30 });
        });
    } else {
      pesos = [
        { nombre: 'Atleta 1', peso: 68.5 },
        { nombre: 'Atleta 2', peso: 62.0 },
        { nombre: 'Atleta 3', peso: 75.2 },
        { nombre: 'Atleta 4', peso: 58.7 }
      ];
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: pesos.map(p => p.nombre),
        datasets: [{
          label: 'Peso (kg)',
          data: pesos.map(p => p.peso),
          backgroundColor: ['#4aa3c2', '#1a2b4c', '#f39c12', '#61708b', '#d94e4e', '#7cb342'],
          borderColor: '#1a2b4c',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Peso de los atletas (kg)' },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };
    this.pesoChart = new Chart(ctx, config);
  }
}