import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { EvaluacionService, Evaluacion } from '../../../core/services/evaluacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

interface EvaluacionItem extends Evaluacion {
  usuarioNombre?: string;
  rubricaNombre?: string;
}

@Component({
  selector: 'app-lista-evaluaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadoConexionComponent, LoadingSpinnerComponent],
  templateUrl: './lista-evaluaciones.component.html',
  styleUrls: ['./lista-evaluaciones.component.scss']
})
export class ListaEvaluacionesComponent implements OnInit, OnDestroy {
  cargando = false;
  evaluaciones: EvaluacionItem[] = [];
  evaluacionesFiltradas: EvaluacionItem[] = [];

  searchTerm = '';
  filtroEstado = '';

  esEvaluador = false;
  currentUserId = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private evaluacionService: EvaluacionService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerUsuario();
    this.cargarEvaluaciones();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  obtenerUsuario(): void {
    this.authService.getUser().subscribe(user => {
      this.currentUserId = user?.uid || '';
      this.esEvaluador = user?.roles?.includes('entrenador') || user?.roles?.includes('admin') || false;
    });
  }

  cargarEvaluaciones(): void {
    this.cargando = true;
    this.evaluacionService.getEvaluaciones().subscribe({
      next: (evaluaciones: Evaluacion[]) => {
        this.evaluaciones = evaluaciones.map(ev => ({
          ...ev,
          usuarioNombre: 'Usuario ' + ev.usuarioId,
          rubricaNombre: 'Rúbrica ' + ev.rubricaId
        }));
        this.filtrarEvaluaciones();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error cargando evaluaciones', err);
        this.notificacionService.mostrarError('No se pudieron cargar las evaluaciones');
        this.cargando = false;
      }
    });
  }

  filtrarEvaluaciones(): void {
    let filtradas = this.evaluaciones;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtradas = filtradas.filter(ev =>
        (ev.usuarioNombre?.toLowerCase().includes(term) || ev.titulo.toLowerCase().includes(term))
      );
    } 

    if (this.filtroEstado) {
      filtradas = filtradas.filter(ev => ev.estado === this.filtroEstado);
    }

    this.evaluacionesFiltradas = filtradas; 
  }

  evaluar(evaluacion: EvaluacionItem, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/evaluacion/evaluar', evaluacion.id]);
  }

  irANuevaEvaluacion(): void {
    this.router.navigate(['/evaluacion/realizar']);
  }
}