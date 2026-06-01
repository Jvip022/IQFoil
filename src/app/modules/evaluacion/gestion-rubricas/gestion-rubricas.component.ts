import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { EvaluacionService, Rubrica, Criterio } from '../../../core/services/evaluacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

@Component({
  selector: 'app-gestion-rubricas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './gestion-rubricas.component.html',
  styleUrls: ['./gestion-rubricas.component.scss']
})
export class GestionRubricasComponent implements OnInit, OnDestroy {
  rubricas: Rubrica[] = [];
  cargando = false;

  modalRubricaVisible = false;
  modoEdicion = false;
  rubricaActual: Partial<Rubrica> = { titulo: '', criterios: [] };

  modalEliminarVisible = false;
  rubricaAEliminar: Rubrica | null = null;
  mensajeEliminar = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private evaluacionService: EvaluacionService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarRubricas();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarRubricas(): void {
    this.cargando = true;
    this.evaluacionService.getRubricas().subscribe({
      next: (rubricas: Rubrica[]) => {
        this.rubricas = rubricas;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error cargando rúbricas', err);
        this.notificacionService.mostrarError('No se pudieron cargar las rúbricas');
        this.cargando = false;
      }
    });
  }

  abrirModalRubrica(): void {
    this.modoEdicion = false;
    this.rubricaActual = {
      titulo: '',
      criterios: [{ id: Date.now().toString(), descripcion: '', puntuacionMaxima: 5 }]
    };
    this.modalRubricaVisible = true;
  }

  editarRubrica(rubrica: Rubrica): void {
    this.modoEdicion = true;
    this.rubricaActual = {
      ...rubrica,
      criterios: rubrica.criterios.map(c => ({ ...c }))
    };
    this.modalRubricaVisible = true;
  }

  cerrarModalRubrica(): void {
    this.modalRubricaVisible = false;
  }

  agregarCriterio(): void {
    if (!this.rubricaActual.criterios) {
      this.rubricaActual.criterios = [];
    }
    this.rubricaActual.criterios.push({
      id: Date.now().toString(),
      descripcion: '',
      puntuacionMaxima: 5
    });
  }

  eliminarCriterio(index: number): void {
    if (this.rubricaActual.criterios && this.rubricaActual.criterios.length > 1) {
      this.rubricaActual.criterios.splice(index, 1);
    } else {
      this.notificacionService.mostrarAdvertencia('La rúbrica debe tener al menos un criterio');
    }
  }

  guardarRubrica(): void {
    if (!this.rubricaActual.titulo) {
      this.notificacionService.mostrarAdvertencia('El título es obligatorio');
      return;
    }
    if (!this.rubricaActual.criterios || this.rubricaActual.criterios.length === 0) {
      this.notificacionService.mostrarAdvertencia('Debe agregar al menos un criterio');
      return;
    }
    for (const crit of this.rubricaActual.criterios) {
      if (!crit.descripcion) {
        this.notificacionService.mostrarAdvertencia('Todos los criterios deben tener descripción');
        return;
      }
      if (!crit.puntuacionMaxima || crit.puntuacionMaxima <= 0) {
        this.notificacionService.mostrarAdvertencia('Las puntuaciones máximas deben ser mayores a 0');
        return;
      }
    }

    if (this.modoEdicion) {
      this.evaluacionService.actualizarRubrica(this.rubricaActual as Rubrica).subscribe({
        next: (rubricaActualizada: Rubrica) => {
          const index = this.rubricas.findIndex(r => r.id === rubricaActualizada.id);
          if (index !== -1) this.rubricas[index] = rubricaActualizada;
          this.notificacionService.mostrarExito('Rúbrica actualizada');
          this.cerrarModalRubrica();
        },
        error: (err: any) => {
          console.error('Error actualizando rúbrica', err);
          this.notificacionService.mostrarError('No se pudo actualizar la rúbrica');
        }
      });
    } else {
      this.evaluacionService.crearRubrica(this.rubricaActual as Omit<Rubrica, 'id'>).subscribe({
        next: (nuevaRubrica: Rubrica) => {
          this.rubricas.unshift(nuevaRubrica);
          this.notificacionService.mostrarExito('Rúbrica creada');
          this.cerrarModalRubrica();
        },
        error: (err: any) => {
          console.error('Error creando rúbrica', err);
          this.notificacionService.mostrarError('No se pudo crear la rúbrica');
        }
      });
    }
  }

  confirmarEliminar(rubrica: Rubrica): void {
    this.rubricaAEliminar = rubrica;
    this.mensajeEliminar = `¿Estás seguro de que deseas eliminar la rúbrica "${rubrica.titulo}"?`;
    this.modalEliminarVisible = true;
  }

  cancelarEliminar(): void {
    this.modalEliminarVisible = false;
    this.rubricaAEliminar = null;
  }

  eliminarRubrica(): void {
    if (!this.rubricaAEliminar) return;
    this.evaluacionService.eliminarRubrica(this.rubricaAEliminar.id).subscribe({
      next: () => {
        this.rubricas = this.rubricas.filter(r => r.id !== this.rubricaAEliminar!.id);
        this.notificacionService.mostrarExito('Rúbrica eliminada');
        this.cancelarEliminar();
      },
      error: (err: any) => {
        console.error('Error eliminando rúbrica', err);
        this.notificacionService.mostrarError('No se pudo eliminar la rúbrica');
        this.cancelarEliminar();
      }
    });
  }
}