import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'configuracion',
        loadComponent: () => import('./configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./estadisticas-uso/estadisticas-uso.component').then(m => m.EstadisticasUsoComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent)
      },
      {
        path: 'moderacion',
        loadComponent: () => import('./moderacion/moderacion.component').then(m => m.ModeracionComponent)
      },
      {
        path: 'contenido',           
        loadComponent: () => import('./gestion-contenido/gestion-contenido.component').then(m => m.GestionContenidoComponent)
      },
      {
        path: '',
        redirectTo: 'estadisticas',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministracionRoutingModule { }