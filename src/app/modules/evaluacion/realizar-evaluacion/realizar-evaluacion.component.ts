// realizar-evaluacion.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { EvaluacionService, VideoPractica } from '../../../core/services/evaluacion.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-realizar-evaluacion',
  standalone: true,
  imports: [CommonModule, EstadoConexionComponent, LoadingSpinnerComponent],
  templateUrl: './realizar-evaluacion.component.html',
  styleUrls: ['./realizar-evaluacion.component.scss']
})
export class RealizarEvaluacionComponent implements OnInit, OnDestroy {
  cargando = false;
  pendientes: VideoPractica[] = []; // Usamos directamente VideoPractica
  private subscriptions: Subscription[] = [];

  constructor(
    private evaluacionService: EvaluacionService,
    private notificacionService: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPendientes();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarPendientes(): void {
    this.cargando = true;
    this.evaluacionService.getVideosPendientes().subscribe({
      next: (videos: VideoPractica[]) => {
        this.pendientes = videos;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error cargando prácticas pendientes', err);
        this.notificacionService.mostrarError('No se pudieron cargar las prácticas pendientes');
        this.cargando = false;
      }
    });
  }

  evaluar(item: VideoPractica): void {
    this.router.navigate(['/evaluacion/evaluar', item.id]);
  }
}