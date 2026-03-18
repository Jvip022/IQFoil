import { Routes } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
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
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];