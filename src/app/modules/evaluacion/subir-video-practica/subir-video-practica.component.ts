import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EvaluacionService, Rubrica } from '../../../core/services/evaluacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { FileSizePipe } from '../../../shared/pipes/shared-pipes';

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

    const formData = new FormData();
    formData.append('titulo', this.videoData.titulo);
    formData.append('descripcion', this.videoData.descripcion || '');
    formData.append('rubricaId', this.videoData.rubricaId);
    formData.append('archivo', this.archivoSeleccionado);

    this.evaluacionService.subirVideo(formData).subscribe({
      next: (response: any) => {
        this.subiendo = false;
        this.notificacionService.mostrarExito('Práctica subida correctamente');
        this.router.navigate(['/evaluacion/lista']);
      },
      error: (err) => {
        console.error('Error subiendo video', err);
        this.subiendo = false;
        this.notificacionService.mostrarError('No se pudo subir el video');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/evaluacion/lista']);
  }
}