import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { rolGuard } from '../../core/guards/rol.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard], 
    children: [
      {
        path: 'configuracion',
        loadComponent: () => import('./configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        canActivate: [rolGuard],
        data: { roles: ['admin', 'entrenador', 'atleta'] }
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./estadisticas-uso/estadisticas-uso.component').then(m => m.EstadisticasUsoComponent),
        canActivate: [rolGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent),
        canActivate: [rolGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'moderacion',
        loadComponent: () => import('./moderacion/moderacion.component').then(m => m.ModeracionComponent),
        canActivate: [rolGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'contenido',
        loadComponent: () => import('./gestion-contenido/gestion-contenido.component').then(m => m.GestionContenidoComponent),
        canActivate: [rolGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'reportes',
        loadComponent: () => import('./reportes/reportes.component').then(m => m.ReportesComponent),
        canActivate: [rolGuard],
        data: { roles: ['admin', 'entrenador'] }
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