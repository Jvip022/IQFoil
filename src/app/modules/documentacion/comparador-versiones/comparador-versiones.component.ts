import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Servicios
import { DocumentoService, Documento } from '../../../core/services/documento.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

export interface Version {
  id: string;
  documentoId: string;
  nombre: string;
  fecha: Date;
  contenido?: string;
  url?: string;
}

export interface Diferencia {
  tipo: 'adicion' | 'eliminacion' | 'modificacion';
  original?: string;
  nuevo?: string;
  descripcion?: string;
}

export interface ResultadoComparacion {
  documentoId: string;
  versionAId: string;
  versionBId: string;
  diferencias: Diferencia[];
}

@Component({
  selector: 'app-comparador-versiones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './comparador-versiones.component.html',
  styleUrls: ['./comparador-versiones.component.scss']
})
export class ComparadorVersionesComponent implements OnInit {
  documentosDisponibles: Documento[] = [];
  versiones: Version[] = [];
  documentoSeleccionadoId = '';
  versionAId = '';
  versionBId = '';
  comparando = false;
  resultadoComparacion: ResultadoComparacion | null = null;

  // Datos mock de versiones (en una app real vendrían de un servicio)
  private versionesMock: Version[] = [
    { id: 'v1', documentoId: '1', nombre: 'Versión 1.0', fecha: new Date('2024-01-15'), contenido: 'Reglamento inicial...' },
    { id: 'v2', documentoId: '1', nombre: 'Versión 2.0', fecha: new Date('2024-03-20'), contenido: 'Reglamento con cambios en regla 42...' },
    { id: 'v3', documentoId: '2', nombre: 'Borrador 1', fecha: new Date('2024-02-10'), contenido: 'Manual de nudos v1' },
    { id: 'v4', documentoId: '2', nombre: 'Borrador 2', fecha: new Date('2024-04-05'), contenido: 'Manual de nudos v2, añadidos nudos nuevos' }
  ];

  get nombreDocumento(): string {
    const doc = this.documentosDisponibles.find(d => d.id === this.documentoSeleccionadoId);
    return doc ? doc.titulo : '';
  }

  get nombreVersionA(): string {
    const v = this.versiones.find(v => v.id === this.versionAId);
    return v ? v.nombre : '';
  }

  get nombreVersionB(): string {
    const v = this.versiones.find(v => v.id === this.versionBId);
    return v ? v.nombre : '';
  }

  constructor(
    private documentoService: DocumentoService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  cargarDocumentos(): void {
    this.documentoService.getDocumentos().subscribe({
      next: (docs) => {
        this.documentosDisponibles = docs;
      },
      error: (err) => {
        console.error('Error cargando documentos', err);
        this.notificacionService.mostrarError('No se pudieron cargar los documentos');
      }
    });
  }

  cargarVersiones(): void {
    if (!this.documentoSeleccionadoId) {
      this.versiones = [];
      return;
    }

    // Filtrar versiones mock por documentoId
    this.versiones = this.versionesMock.filter(v => v.documentoId === this.documentoSeleccionadoId);

    if (this.versiones.length >= 2) {
      this.versionAId = this.versiones[0].id;
      this.versionBId = this.versiones[1].id;
      this.cargarComparacion();
    } else {
      this.resultadoComparacion = null;
    }
  }

  cargarComparacion(): void {
    if (!this.versionAId || !this.versionBId || this.versionAId === this.versionBId) {
      this.resultadoComparacion = null;
      return;
    }

    this.comparando = true;
    setTimeout(() => {
      this.resultadoComparacion = this.generarComparacionMock(this.versionAId, this.versionBId);
      this.comparando = false;
    }, 400);
  }

  private generarComparacionMock(versionAId: string, versionBId: string): ResultadoComparacion {
    // Simular diferencias (en un caso real se compararían contenidos)
    const vA = this.versiones.find(v => v.id === versionAId);
    const vB = this.versiones.find(v => v.id === versionBId);

    const diferencias: Diferencia[] = [];

    if (vA && vB) {
      if (vA.id === 'v1' && vB.id === 'v2') {
        diferencias.push(
          { tipo: 'modificacion', original: 'Regla 42: permitido', nuevo: 'Regla 42: restringido en ceñida', descripcion: 'Cambio en regla 42' },
          { tipo: 'adicion', nuevo: 'Anexo C: sanciones', descripcion: 'Se añade anexo sobre sanciones' }
        );
      } else if (vA.id === 'v3' && vB.id === 'v4') {
        diferencias.push(
          { tipo: 'adicion', nuevo: 'Nudo de ocho', descripcion: 'Nuevo nudo añadido' },
          { tipo: 'eliminacion', original: 'Nudo simple (obsoleto)', descripcion: 'Se elimina nudo simple' }
        );
      }
    }

    return {
      documentoId: this.documentoSeleccionadoId,
      versionAId,
      versionBId,
      diferencias
    };
  }
}