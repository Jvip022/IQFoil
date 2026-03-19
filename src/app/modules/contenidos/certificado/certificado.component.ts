import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ContenidoService } from '../../../core/services/contenido.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

export interface Certificado {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: Date;
  creditos: number;
  logros?: string[];
  pdfUrl?: string;
}

@Component({
  selector: 'app-certificado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './certificado.component.html',
  styleUrls: ['./certificado.component.scss']
})
export class CertificadoComponent implements OnInit, OnDestroy {
  cargando = false;
  certificados: Certificado[] = [];
  certificadoSeleccionado: Certificado | null = null;
  usuarioNombre = 'Usuario';

  private subscriptions: Subscription[] = [];

  constructor(
    private notificacionService: NotificacionService,
    private usuarioService: UsuarioService,
    private contenidoService: ContenidoService
  ) {}

  ngOnInit(): void {
    this.cargarCertificados();
    this.obtenerNombreUsuario();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarCertificados(): void {
    this.cargando = true;
    // Simular carga desde el servicio de contenidos
    setTimeout(() => {
      this.certificados = [
        {
          id: 'CERT-001',
          titulo: 'Certificado de Iniciación a la Vela',
          descripcion: 'Completaste el curso básico de vela con éxito.',
          fecha: new Date('2025-02-15'),
          creditos: 10,
          logros: ['Principiante', 'Seguridad básica'],
          pdfUrl: '/assets/certificados/001.pdf'
        },
        {
          id: 'CERT-002',
          titulo: 'Certificado de Técnicas de Foils',
          descripcion: 'Dominio de las técnicas de navegación con foils.',
          fecha: new Date('2025-03-20'),
          creditos: 25,
          logros: ['Foil', 'Avanzado'],
          pdfUrl: '/assets/certificados/002.pdf'
        },
        {
          id: 'CERT-003',
          titulo: 'Certificado de Reglamento',
          descripcion: 'Conocimiento profundo del reglamento de regatas.',
          fecha: new Date('2025-01-10'),
          creditos: 15,
          pdfUrl: '/assets/certificados/003.pdf'
        }
      ];
      this.cargando = false;
    }, 600);
  }

  obtenerNombreUsuario(): void {
    this.usuarioService.getPerfil().subscribe({
      next: (user) => {
        this.usuarioNombre = user?.nombre || user?.displayName || 'Usuario';
      },
      error: (err) => {
        console.error('Error obteniendo usuario', err);
      }
    });
  }

  verCertificado(cert: Certificado): void {
    this.certificadoSeleccionado = cert;
  }

  cerrarDetalle(): void {
    this.certificadoSeleccionado = null;
  }

  descargarCertificado(cert: Certificado, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    // Simular descarga
    this.notificacionService.mostrarExito(`Descargando ${cert.titulo}...`);

    // En un caso real, abrirías el PDF o generarías un blob
    if (cert.pdfUrl) {
      const link = document.createElement('a');
      link.href = cert.pdfUrl;
      link.download = `${cert.titulo.replace(/\s+/g, '_')}.pdf`;
      link.click();
    } else {
      // Generar PDF simulado (en una app real se usaría una librería como jsPDF)
      setTimeout(() => {
        this.notificacionService.mostrarExito('Certificado generado (simulación)');
      }, 1000);
    }
  }
}