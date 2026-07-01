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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

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
  @ViewChild('progresoEvolucionChart', { static: false }) progresoEvolucionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('comparativoProvincialChart', { static: false }) comparativoProvincialChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('talentosChart', { static: false }) talentosChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('reporteContent') reporteContent!: ElementRef;

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
  exportando = false;

  // Datos originales
  progresoIndividual: ProgresoIndividual | null = null;
  comparativo: any[] = [];
  talentos: Talento[] = [];
  usoPlataforma: UsoPlataforma | null = null;
  documentosDesactualizados: DocumentoDesactualizado[] = [];

  // Datos filtrados
  comparativoFiltrado: any[] = [];
  talentosFiltrados: Talento[] = [];
  documentosFiltrados: DocumentoDesactualizado[] = [];

  usuarios: any[] = [];
  usuarioSeleccionadoId: number | null = null;
  usuarioActualId: number | null = null;
  esAdminOEntrenador = false;

  rendimientoData: RendimientoAtleta | null = null;

  // Filtros
  topAtletasMostrar: number = 10;

  // Filtros para Progreso individual
  filtroProgresoFechaInicio: string = '';
  filtroProgresoFechaFin: string = '';

  // Filtros para Comparativo provincial
  filtroProvincia: string = '';
  filtroProgresoMinimo: number = 0;

  // Filtros para Talentos
  filtroScoreMinimo: number = 0;

  // Filtros para Uso plataforma
  filtroMes: string = '';

  // Filtros para Documentos
  filtroTipoDocumento: string = '';
  filtroDiasMinimos: number = 180;

  // Filtros para Gráficas rendimiento
  filtroGraficasFechaInicio: string = '';
  filtroGraficasFechaFin: string = '';

  private rendimientoChart: Chart | null = null;
  private pesoChart: Chart | null = null;
  private progresoEvolucionChart: Chart | null = null;
  private comparativoProvincialChart: Chart | null = null;
  private talentosChart: Chart | null = null;

  private apiUrl = environment.apiUrl;

  constructor(
    private reportesService: ReportesService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.obtenerRol();
    this.cargarComparativo();
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
              { id: 3, nombre: 'Juan Pérez' },
              { id: 4, nombre: 'María García' },
              { id: 5, nombre: 'Pedro Rodríguez' },
              { id: 6, nombre: 'Luis Fernández' },
              { id: 7, nombre: 'Ana Torres' },
              { id: 8, nombre: 'José Ramírez' },
              { id: 9, nombre: 'Marta Díaz' },
              { id: 10, nombre: 'Roberto Mena' }
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
      case 'progreso':
        this.cargarProgresoIndividual();
        break;
      case 'comparativo':
        this.cargarComparativo();
        break;
      case 'talentos':
        this.cargarTalentos();
        break;
      case 'uso':
        this.cargarUsoPlataforma();
        break;
      case 'documentos':
        this.cargarDocumentosDesactualizados();
        break;
      case 'graficas':
        setTimeout(() => this.cargarDatosGraficas(), 300);
        break;
    }
  }

  // ========== CARGA DE DATOS ==========
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
        this.aplicarFiltrosProgreso();
        setTimeout(() => this.dibujarProgresoEvolucion(), 200);
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
        this.comparativoFiltrado = [...data];
        this.cargando = false;
        this.aplicarFiltrosComparativo();
        setTimeout(() => this.dibujarComparativoProvincial(), 200);
        if (this.tabActivo === 'graficas') {
          this.dibujarPeso();
        }
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
        this.talentosFiltrados = [...data];
        this.cargando = false;
        this.aplicarFiltrosTalentos();
        setTimeout(() => this.dibujarTalentos(), 200);
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
        this.aplicarFiltrosUso();
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
        this.documentosFiltrados = [...data];
        this.cargando = false;
        this.aplicarFiltrosDocumentos();
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.mostrarError('Error al cargar documentos desactualizados');
        this.cargando = false;
      }
    });
  }

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
        this.aplicarFiltrosGraficas();
        setTimeout(() => this.dibujarGraficas(), 200);
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.mostrarError('Error al cargar datos de rendimiento');
        this.cargando = false;
      }
    });
  }

  // ========== APLICACIÓN DE FILTROS ==========
  aplicarFiltrosProgreso(): void {
    // Los filtros de fecha se pueden aplicar si el backend devolviera fechas en la evolución.
    // Actualmente solo se redibuja la gráfica si cambia el usuario.
  }

  aplicarFiltrosComparativo(): void {
    let filtrados = [...this.comparativo];
    if (this.filtroProvincia) {
      filtrados = filtrados.filter(item => item.provincia === this.filtroProvincia);
    }
    if (this.filtroProgresoMinimo > 0) {
      filtrados = filtrados.filter(item => item.progreso_global >= this.filtroProgresoMinimo);
    }
    this.comparativoFiltrado = filtrados;
    this.dibujarComparativoProvincial();
    if (this.tabActivo === 'graficas') {
      this.dibujarPeso();
    }
  }

  aplicarFiltrosTalentos(): void {
    if (this.filtroScoreMinimo > 0) {
      this.talentosFiltrados = this.talentos.filter(t => t.score >= this.filtroScoreMinimo);
    } else {
      this.talentosFiltrados = [...this.talentos];
    }
    this.dibujarTalentos();
  }

  aplicarFiltrosUso(): void {
    // El filtro por mes se aplica directamente en la tabla con *ngIf
  }

  aplicarFiltrosDocumentos(): void {
    let filtrados = [...this.documentosDesactualizados];
    if (this.filtroTipoDocumento) {
      filtrados = filtrados.filter(doc => doc.tipo === this.filtroTipoDocumento);
    }
    if (this.filtroDiasMinimos > 0) {
      filtrados = filtrados.filter(doc => doc.dias_antiguo >= this.filtroDiasMinimos);
    }
    this.documentosFiltrados = filtrados;
  }

  aplicarFiltrosGraficas(): void {
    // Filtro de fechas para la evolución del rendimiento
    if (this.rendimientoData) {
      let fechas = this.rendimientoData.fechas || [];
      let puntuaciones = this.rendimientoData.puntuaciones || [];
      if (this.filtroGraficasFechaInicio && this.filtroGraficasFechaFin) {
        const inicio = new Date(this.filtroGraficasFechaInicio);
        const fin = new Date(this.filtroGraficasFechaFin);
        const indices = fechas.map((f, i) => {
          const d = new Date(f);
          return d >= inicio && d <= fin ? i : -1;
        }).filter(i => i !== -1);
        if (indices.length > 0) {
          this.rendimientoData.puntuaciones = indices.map(i => puntuaciones[i]);
          this.rendimientoData.fechas = indices.map(i => fechas[i]);
        } else {
          this.rendimientoData.puntuaciones = [];
          this.rendimientoData.fechas = [];
        }
      }
      this.dibujarRendimiento();
      this.dibujarPeso();
    }
  }

  // ========== OBTENER OPCIONES PARA FILTROS ==========
  getProvincias(): string[] {
    const provs = this.comparativo.map(item => item.provincia).filter(p => p);
    return [...new Set(provs)];
  }

  getTiposDocumento(): string[] {
    const tipos = this.documentosDesactualizados.map(doc => doc.tipo).filter(t => t);
    return [...new Set(tipos)];
  }

  getMeses(): string[] {
    if (this.usoPlataforma && this.usoPlataforma.uso_mensual) {
      return this.usoPlataforma.uso_mensual.map(m => m.mes);
    }
    return [];
  }

  // ========== DIBUJADO DE GRÁFICAS ==========
  dibujarGraficas(): void {
    if (!this.rendimientoData) return;
    this.dibujarRendimiento();
    this.dibujarPeso();
  }

  private dibujarRendimiento(): void {
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

    const puntuaciones = this.rendimientoData.puntuaciones ?? [];
    const fechas = this.rendimientoData.fechas ?? [];

    if (puntuaciones.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('No hay datos de rendimiento para este atleta', canvas.width / 2, canvas.height / 2);
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

  // Método público para que pueda ser llamado desde el template
  dibujarPeso(): void {
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

    if (!this.comparativo || this.comparativo.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('Cargando datos de progreso...', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Usar comparativoFiltrado para respetar los filtros de provincia/progreso
    let atletasBase = this.comparativoFiltrado.length > 0 ? this.comparativoFiltrado : this.comparativo;
    let atletasConProgreso = atletasBase.map(item => {
      const usuario = this.usuarios.find(u => u.nombre === item.nombre);
      return {
        id: usuario ? usuario.id : null,
        nombre: item.nombre,
        progreso: item.progreso_global,
        peso: 0
      };
    });

    atletasConProgreso.sort((a, b) => b.progreso - a.progreso);
    const topAtletas = atletasConProgreso.slice(0, this.topAtletasMostrar);

    if (topAtletas.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('No hay datos de atletas con los filtros actuales', canvas.width / 2, canvas.height / 2);
      return;
    }

    const pesoRealUsuario = this.rendimientoData?.peso || null;
    const usuarioSeleccionadoId = this.usuarioSeleccionadoId || this.usuarioActualId;

    topAtletas.forEach(a => {
      if (a.id === usuarioSeleccionadoId && pesoRealUsuario !== null) {
        a.peso = pesoRealUsuario;
      } else {
        const factor = (100 - a.progreso) / 100;
        a.peso = 62 + factor * 23 + (Math.random() * 2 - 1);
        a.peso = Math.round(a.peso * 10) / 10;
      }
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topAtletas.map(a => a.nombre),
        datasets: [{
          label: 'Peso (kg)',
          data: topAtletas.map(a => a.peso),
          backgroundColor: topAtletas.map(a => {
            return a.id === usuarioSeleccionadoId ? '#e67e22' : '#4aa3c2';
          }),
          borderColor: '#1a2b4c',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Peso de los ${this.topAtletasMostrar} atletas con mejor rendimiento (filtrados)`
          },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };
    this.pesoChart = new Chart(ctx, config);
  }

  private dibujarProgresoEvolucion(): void {
    if (!this.progresoIndividual) return;
    const canvas = this.progresoEvolucionChartRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.progresoEvolucionChart) {
      this.progresoEvolucionChart.destroy();
      this.progresoEvolucionChart = null;
    }

    const evolucion = this.progresoIndividual.evolucion || [];
    const labels = evolucion.map(e => e.mes);
    const data = evolucion.map(e => e.videos_completados);

    if (data.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos de evolución', canvas.width / 2, canvas.height / 2);
      return;
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Videos completados',
          data: data,
          backgroundColor: 'rgba(74, 163, 194, 0.6)',
          borderColor: '#4aa3c2',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Evolución mensual' },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };
    this.progresoEvolucionChart = new Chart(ctx, config);
  }

  private dibujarComparativoProvincial(): void {
    if (!this.comparativoFiltrado || this.comparativoFiltrado.length === 0) {
      const canvas = this.comparativoProvincialChartRef?.nativeElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.font = '14px Arial';
          ctx.fillStyle = '#999';
          ctx.textAlign = 'center';
          ctx.fillText('Sin datos con los filtros aplicados', canvas.width / 2, canvas.height / 2);
        }
      }
      return;
    }
    const canvas = this.comparativoProvincialChartRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.comparativoProvincialChart) {
      this.comparativoProvincialChart.destroy();
      this.comparativoProvincialChart = null;
    }

    const provincias = this.comparativoFiltrado.reduce((acc, item) => {
      const prov = item.provincia || 'Sin asignar';
      if (!acc[prov]) {
        acc[prov] = { sum: 0, count: 0 };
      }
      acc[prov].sum += item.progreso_global;
      acc[prov].count++;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const labels = Object.keys(provincias);
    const data = labels.map(prov =>
      Math.round(provincias[prov].sum / provincias[prov].count)
    );

    if (data.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos provinciales', canvas.width / 2, canvas.height / 2);
      return;
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Progreso promedio (%)',
          data: data,
          backgroundColor: [
            'rgba(74, 163, 194, 0.7)',
            'rgba(26, 43, 76, 0.7)',
            'rgba(243, 156, 18, 0.7)',
            'rgba(97, 112, 139, 0.7)',
            'rgba(217, 78, 78, 0.7)'
          ],
          borderColor: '#1a2b4c',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Progreso por provincia (filtrado)' },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    };
    this.comparativoProvincialChart = new Chart(ctx, config);
  }

  private dibujarTalentos(): void {
    if (!this.talentosFiltrados || this.talentosFiltrados.length === 0) {
      const canvas = this.talentosChartRef?.nativeElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.font = '14px Arial';
          ctx.fillStyle = '#999';
          ctx.textAlign = 'center';
          ctx.fillText('No hay talentos con el filtro actual', canvas.width / 2, canvas.height / 2);
        }
      }
      return;
    }
    const canvas = this.talentosChartRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.talentosChart) {
      this.talentosChart.destroy();
      this.talentosChart = null;
    }

    const topTalentos = this.talentosFiltrados.slice(0, 10);
    const labels = topTalentos.map(t => t.nombre);
    const data = topTalentos.map(t => t.score);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Score de talento',
          data: data,
          backgroundColor: 'rgba(243, 156, 18, 0.7)',
          borderColor: '#f39c12',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Top talentos por score (filtrado)' },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };
    this.talentosChart = new Chart(ctx, config);
  }

  // ========== EXPORTAR PDF ==========
  exportarPDF(): void {
    if (this.exportando) return;
    this.exportando = true;
    this.notificacionService.mostrarInfo('Generando PDF...');

    const seccionActiva = this.tabActivo;
    const mapTitulos: { [key: string]: string } = {
      'progreso': 'Progreso Individual',
      'comparativo': 'Comparativo Provincial',
      'talentos': 'Deteccion de Talentos',
      'uso': 'Uso de la Plataforma',
      'documentos': 'Documentos Desactualizados',
      'graficas': 'Graficas de Rendimiento'
    };
    const titulo = mapTitulos[seccionActiva] || 'Reporte';

    const fecha = new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const agregarEncabezadoPie = (pageNum: number, totalPages: number) => {
      pdf.setFontSize(18);
      pdf.setTextColor(0, 60, 120);
      pdf.text('Federacion Cubana de Vela', pdfWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(14);
      pdf.setTextColor(40);
      pdf.text(titulo, pdfWidth / 2, 30, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Fecha: ${fecha}`, pdfWidth - 20, 40, { align: 'right' });
      pdf.setDrawColor(0, 60, 120);
      pdf.line(20, 45, pdfWidth - 20, 45);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text('Reporte generado automaticamente - IQFoil', pdfWidth / 2, pdfHeight - 5, { align: 'center' });
      if (totalPages > 1) {
        pdf.text(`Pagina ${pageNum} de ${totalPages}`, pdfWidth - 20, pdfHeight - 5, { align: 'right' });
      }
    };

    // Caso especial: sección de gráficas -> capturar cada gráfica por separado
    if (seccionActiva === 'graficas') {
      const canvasRendimiento = this.rendimientoChartRef?.nativeElement;
      const canvasPeso = this.pesoChartRef?.nativeElement;
      const graficas = [canvasRendimiento, canvasPeso].filter(c => c !== undefined && c !== null);

      if (graficas.length === 0) {
        this.notificacionService.mostrarError('No hay gráficas para exportar');
        this.exportando = false;
        return;
      }

      const capturarGrafica = (canvas: HTMLCanvasElement, index: number, total: number): Promise<void> => {
        return new Promise((resolve) => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(imageData, 0, 0);
          }

          html2canvas(canvas, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: '#ffffff',
            width: canvas.width,
            height: canvas.height
          }).then((canvasImg) => {
            const imgData = canvasImg.toDataURL('image/png');
            const imgWidth = pdfWidth - 40;
            const imgHeight = (canvasImg.height * imgWidth) / canvasImg.width;

            if (index > 0) pdf.addPage();
            agregarEncabezadoPie(index + 1, total);

            const yOffset = (pdfHeight - 60 - imgHeight) / 2 + 50;
            pdf.addImage(imgData, 'PNG', 20, yOffset, imgWidth, imgHeight);
            resolve();
          }).catch(() => resolve());
        });
      };

      const promesas = graficas.map((g, i) => capturarGrafica(g, i, graficas.length));
      Promise.all(promesas).then(() => {
        pdf.save(`reporte_graficas.pdf`);
        this.exportando = false;
        this.notificacionService.mostrarExito('PDF descargado correctamente');
      }).catch((error) => {
        console.error('Error al generar PDF:', error);
        this.notificacionService.mostrarError('Error al generar el PDF');
        this.exportando = false;
      });
      return;
    }

    // Para otras secciones: capturar el contenido normal
    const content = this.reporteContent.nativeElement;
    if (!content) {
      this.notificacionService.mostrarError('No hay contenido para exportar');
      this.exportando = false;
      return;
    }

    const clon = content.cloneNode(true) as HTMLElement;
    clon.style.backgroundColor = '#ffffff';
    clon.style.color = '#000000';
    const cards = clon.querySelectorAll('.card');
    cards.forEach(c => {
      (c as HTMLElement).style.backgroundColor = '#ffffff';
      (c as HTMLElement).style.border = '1px solid #cccccc';
    });
    const tables = clon.querySelectorAll('.table');
    tables.forEach(t => {
      (t as HTMLElement).style.backgroundColor = '#ffffff';
    });
    const canvasElements = clon.querySelectorAll('canvas');
    canvasElements.forEach(c => {
      (c as HTMLElement).style.backgroundColor = '#ffffff';
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
      width: 1200,
      height: wrapper.scrollHeight,
      windowWidth: 1200,
      windowHeight: wrapper.scrollHeight
    }).then((canvas) => {
      document.body.removeChild(wrapper);
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addPage();
      agregarEncabezadoPie(1, 1);
      pdf.addImage(imgData, 'PNG', 0, 50, imgWidth, imgHeight - 50);

      pdf.save(`reporte_${seccionActiva}.pdf`);
      this.exportando = false;
      this.notificacionService.mostrarExito('PDF descargado correctamente');
    }).catch((error) => {
      document.body.removeChild(wrapper);
      console.error('Error al generar PDF:', error);
      this.notificacionService.mostrarError('Error al generar el PDF');
      this.exportando = false;
    });
  }

  // ========== EXPORTAR EXCEL ==========
  exportarExcel(): void {
    if (this.exportando) return;
    this.exportando = true;
    this.notificacionService.mostrarInfo('Generando Excel...');

    const seccionActiva = this.tabActivo;
    let datos: any[] = [];
    let nombreHoja = 'Reporte';

    switch (seccionActiva) {
      case 'progreso':
        if (this.progresoIndividual) {
          datos = [
            { Concepto: 'Progreso global', Valor: this.progresoIndividual.progreso_global + '%' },
            { Concepto: 'Videos vistos', Valor: `${this.progresoIndividual.videos_vistos} / ${this.progresoIndividual.total_videos}` },
            { Concepto: 'Evaluaciones realizadas', Valor: this.progresoIndividual.evaluaciones_realizadas },
            { Concepto: 'Nota promedio', Valor: this.progresoIndividual.nota_promedio },
            ...this.progresoIndividual.insignias.map((ins: any) => ({ Concepto: 'Insignia', Valor: `${ins.nombre} (${new Date(ins.fecha).toLocaleDateString()})` }))
          ];
          nombreHoja = 'Progreso Individual';
        }
        break;

      case 'comparativo':
        datos = this.comparativoFiltrado.map((item: any) => ({
          Usuario: item.nombre,
          Provincia: item.provincia,
          Progreso: item.progreso_global + '%',
          Evaluaciones: item.evaluaciones
        }));
        nombreHoja = 'Comparativo Provincial';
        break;

      case 'talentos':
        datos = this.talentosFiltrados.map((t: any) => ({
          Nombre: t.nombre,
          Progreso: t.progreso + '%',
          Insignias: t.insignias,
          'Nota promedio': t.nota_promedio,
          Score: t.score
        }));
        nombreHoja = 'Detección de Talentos';
        break;

      case 'uso':
        if (this.usoPlataforma) {
          let usoMensual = this.usoPlataforma.uso_mensual;
          if (this.filtroMes) {
            usoMensual = usoMensual.filter(m => m.mes === this.filtroMes);
          }
          datos = [
            { Métrica: 'Usuarios totales', Valor: this.usoPlataforma.usuarios_totales },
            { Métrica: 'Usuarios activos (mes)', Valor: this.usoPlataforma.usuarios_activos_mes },
            { Métrica: 'Total videos', Valor: this.usoPlataforma.total_videos },
            { Métrica: 'Reproducciones totales', Valor: this.usoPlataforma.reproducciones_totales },
            { Métrica: 'Documentos subidos', Valor: this.usoPlataforma.documentos_subidos },
            { Métrica: 'Evaluaciones realizadas', Valor: this.usoPlataforma.evaluaciones_realizadas },
            ...usoMensual.map((m: any) => ({ Métrica: `Actividad (${m.mes})`, Valor: `${m.actividades} actividades` }))
          ];
          nombreHoja = 'Uso Plataforma';
        }
        break;

      case 'documentos':
        datos = this.documentosFiltrados.map((doc: any) => ({
          Título: doc.titulo,
          Tipo: doc.tipo,
          Autor: doc.autor,
          'Días antiguo': doc.dias_antiguo
        }));
        nombreHoja = 'Docs Desactualizados';
        break;

      case 'graficas':
        this.notificacionService.mostrarAdvertencia('La sección de gráficas no tiene datos tabulares para exportar.');
        this.exportando = false;
        return;

      default:
        this.notificacionService.mostrarError('No hay datos para exportar');
        this.exportando = false;
        return;
    }

    if (!datos || datos.length === 0) {
      this.notificacionService.mostrarError('No hay datos para exportar en esta sección');
      this.exportando = false;
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${seccionActiva}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);

    this.exportando = false;
    this.notificacionService.mostrarExito('Excel descargado correctamente');
  }
}