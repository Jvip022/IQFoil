import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Servicios
import { EvaluacionService, Rubrica } from '../../../core/services/evaluacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { FileSizePipe } from '../../../shared/biblioteca-offline/biblioteca-offline.component'; // reutilizado

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';

@Component({
  selector: 'app-subir-video-practica',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    FileSizePipe
  ],
  templateUrl: './subir-video-practica.component.html',
  styleUrls: ['./subir-video-practica.component.scss']
})
export class SubirVideoPracticaComponent implements OnInit {
  rubricas: Rubrica[] = [];
  subiendo = false;

  videoData = {
    titulo: '',
    descripcion: '',
    rubricaId: ''
  };
  archivoSeleccionado: File | null = null;

  constructor(
    private evaluacionService: EvaluacionService,
    private notificacionService: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRubricas();
  }

  cargarRubricas(): void {
    this.evaluacionService.getRubricas().subscribe({
      next: (rubricas) => {
        this.rubricas = rubricas;
      },
      error: (err) => {
        console.error('Error cargando rúbricas', err);
        this.notificacionService.mostrarError('No se pudieron cargar las rúbricas');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  subirVideo(): void {
    if (!this.videoData.titulo || !this.videoData.rubricaId || !this.archivoSeleccionado) {
      this.notificacionService.mostrarAdvertencia('Completa todos los campos obligatorios');
      return;
    }

    this.subiendo = true;
    // Simular subida
    setTimeout(() => {
      this.subiendo = false;
      this.notificacionService.mostrarExito('Práctica subida correctamente');
      this.router.navigate(['/evaluacion/lista-evaluaciones']);
    }, 1500);
  }

  cancelar(): void {
    this.router.navigate(['/evaluacion/lista-evaluaciones']);
  }
}