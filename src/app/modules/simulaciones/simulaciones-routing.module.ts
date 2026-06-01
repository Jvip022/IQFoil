import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
  path: '',
  canActivate: [AuthGuard],
    children: [
     {
        path: 'simulador',
        loadComponent: () => import('./simulador-foil/simulador-foil.component').then(m => m.SimuladorFoilComponent)
     },
     {
        path: '',
        redirectTo: 'simulador',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SimulacionesRoutingModule { }
