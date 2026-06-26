import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { autenticacionGuard } from '../../core/guards/autenticacion.guard';
import { rolGuard } from '../../core/guards/rol.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [autenticacionGuard],
    children: [
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
      },
      {
        path: 'lista',
        loadComponent: () => import('./lista-evaluaciones/lista-evaluaciones.component').then(m => m.ListaEvaluacionesComponent),
        canActivate: [rolGuard],
        data: { roles: ['admin', 'entrenador'] }
      },
      {
        path: 'evaluar/:id',
        loadComponent: () => import('./evaluar-con-rubrica/evaluar-con-rubrica.component').then(m => m.EvaluarConRubricaComponent),
        canActivate: [autenticacionGuard]
      },
      {
        path: 'rubricas',
        loadComponent: () => import('./gestion-rubricas/gestion-rubricas.component').then(m => m.GestionRubricasComponent),
        canActivate: [autenticacionGuard]
      },
      {
        path: 'realizar',
        loadComponent: () => import('./realizar-evaluacion/realizar-evaluacion.component').then(m => m.RealizarEvaluacionComponent),
        canActivate: [autenticacionGuard]
      },
      {
        path: 'reporte',
        loadComponent: () => import('./reporte-progreso/reporte-progreso.component').then(m => m.ReporteProgresoComponent),
        canActivate: [autenticacionGuard]
      },
      {
        path: 'subir',
        loadComponent: () => import('./subir-video-practica/subir-video-practica.component').then(m => m.SubirVideoPracticaComponent),
        canActivate: [autenticacionGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluacionRoutingModule { }