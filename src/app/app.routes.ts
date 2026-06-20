import { Routes } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { autenticacionGuard } from './core/guards/autenticacion.guard';
import { rolGuard } from './core/guards/rol.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [autenticacionGuard] },
  {
    path: 'contenidos',
    loadChildren: () => import('./modules/contenidos/contenidos.module').then(m => m.ContenidosModule),
    canActivate: [autenticacionGuard]
  },
  {
    path: 'documentacion',
    loadChildren: () => import('./modules/documentacion/documentacion.module').then(m => m.DocumentacionModule),
    canActivate: [autenticacionGuard]
  },
  {
    path: 'talentos',
    loadChildren: () => import('./modules/talentos/talentos.module').then(m => m.TalentosModule),
    canActivate: [autenticacionGuard, rolGuard],
    data: { roles: ['admin', 'entrenador'] }
  },
  {
    path: 'comunidad',
    loadChildren: () => import('./modules/comunidad/comunidad.module').then(m => m.ComunidadModule),
    canActivate: [autenticacionGuard]
  },
  {
    path: 'administracion',
    loadChildren: () => import('./modules/administracion/administracion.module').then(m => m.AdministracionModule),
    canActivate: [autenticacionGuard, rolGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'evaluacion',
    loadChildren: () => import('./modules/evaluacion/evaluacion.module').then(m => m.EvaluacionModule),
    canActivate: [autenticacionGuard, rolGuard],
    data: { roles: ['admin', 'entrenador'] }
  },
  {
    path: 'simulaciones',
    loadChildren: () => import('./modules/simulaciones/simulaciones.module').then(m => m.SimulacionesModule),
    canActivate: [autenticacionGuard]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];