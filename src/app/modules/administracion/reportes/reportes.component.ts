import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService, ProgresoIndividual, Talento, UsoPlataforma, DocumentoDesactualizado } from '../../../core/services/reportes.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadoConexionComponent, LoadingSpinnerComponent],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
  tabs = [
    { id: 'progreso', nombre: 'Progreso individual', icono: '📈' },
    { id: 'comparativo', nombre: 'Comparativo provincial', icono: '🏙️' },
    { id: 'talentos', nombre: 'Detección talentos', icono: '🌟' },
    { id: 'uso', nombre: 'Uso plataforma', icono: '📊' },
    { id: 'documentos', nombre: 'Docs desactualizados', icono: '📄' }
  ];
  tabActivo = 'progreso';
  cargando = false;

  // Datos
  progresoIndividual: ProgresoIndividual | null = null;
  comparativo: any[] = [];
  talentos: Talento[] = [];
  usoPlataforma: UsoPlataforma | null = null;
  documentosDesactualizados: DocumentoDesactualizado[] = [];

  // Selección de usuario para reporte individual
  usuarios: any[] = [];
  usuarioSeleccionadoId: number | null = null;
  usuarioActualId: number | null = null;
  esAdminOEntrenador = false;

  constructor(
    private reportesService: ReportesService,
    private notificacionService: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.obtenerRol();
  }

  obtenerRol(): void {
    this.authService.getUser().subscribe(user => {
      this.usuarioActualId = user?.uid ? parseInt(user.uid) : null;
      this.esAdminOEntrenador = user?.roles?.includes('admin') || user?.roles?.includes('entrenador') || false;
      if (this.tabActivo === 'progreso') {
        this.cargarProgresoIndividual();
      }
    });
  }

  cargarUsuarios(): void {
    // Simulación: obtener lista de usuarios (en proyecto real usar AdminService)
    this.usuarios = [
      { id: 1, nombre: 'Juan Pérez' },
      { id: 2, nombre: 'María García' },
      { id: 3, nombre: 'Carlos López' }
    ];
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
    }
  }

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
}