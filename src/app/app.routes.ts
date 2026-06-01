import { Routes } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
// import { FoilHomeComponent } from './foil-home/foil-home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // { path: 'foil-home', component: FoilHomeComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  {
    path: 'contenidos',
    loadChildren: () => import('./modules/contenidos/contenidos.module').then(m => m.ContenidosModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'documentacion',
    loadChildren: () => import('./modules/documentacion/documentacion.module').then(m => m.DocumentacionModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'talentos',
    loadChildren: () => import('./modules/talentos/talentos.module').then(m => m.TalentosModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'comunidad',
    loadChildren: () => import('./modules/comunidad/comunidad.module').then(m => m.ComunidadModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'administracion',
    loadChildren: () => import('./modules/administracion/administracion.module').then(m => m.AdministracionModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'evaluacion',
    loadChildren: () => import('./modules/evaluacion/evaluacion.module').then(m => m.EvaluacionModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'simulaciones',
    loadChildren: () => import('./modules/simulaciones/simulaciones.module').then(m => m.SimulacionesModule),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];