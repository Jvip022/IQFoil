import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
      },
      {
        path: 'lista',
        loadComponent: () => import('./lista-evaluaciones/lista-evaluaciones.component').then(m => m.ListaEvaluacionesComponent)
      },
      {
        path: 'evaluar/:id',
        loadComponent: () => import('./evaluar-con-rubrica/evaluar-con-rubrica.component').then(m => m.EvaluarConRubricaComponent)
      },
      {
        path: 'rubricas',
        loadComponent: () => import('./gestion-rubricas/gestion-rubricas.component').then(m => m.GestionRubricasComponent)
      },
      {
        path: 'realizar',
        loadComponent: () => import('./realizar-evaluacion/realizar-evaluacion.component').then(m => m.RealizarEvaluacionComponent)
      },
      {
        path: 'reporte',
        loadComponent: () => import('./reporte-progreso/reporte-progreso.component').then(m => m.ReporteProgresoComponent)
      },
      {
        path: 'subir',
        loadComponent: () => import('./subir-video-practica/subir-video-practica.component').then(m => m.SubirVideoPracticaComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluacionRoutingModule { }