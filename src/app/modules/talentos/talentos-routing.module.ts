import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'insignias',
        loadComponent: () => import('./insignias/insignias.component').then(m => m.InsigniasComponent)
      },
      {
        path: 'alertas',
        loadComponent: () => import('./alertas-talento/alertas-talento.component').then(m => m.AlertasTalentoComponent)
      },
      {
        path: 'recomendaciones',
        loadComponent: () => import('./recomendaciones/recomendaciones.component').then(m => m.RecomendacionesComponent)
      },
      {
        path: 'metricas',
        loadComponent: () => import('./panel-metricas/panel-metricas.component').then(m => m.PanelMetricasComponent)
      },
      {
        path: '',
        redirectTo: 'recomendaciones',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TalentosRoutingModule { }