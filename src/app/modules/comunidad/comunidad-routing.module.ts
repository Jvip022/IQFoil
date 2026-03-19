import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'foro',
        loadComponent: () => import('./foro/foro.component').then(m => m.ForoComponent)
      },
      {
        path: 'foro/hilo/:id',
        loadComponent: () => import('./hilo-detalle/hilo-detalle.component').then(m => m.HiloDetalleComponent)
      },
      {
        path: 'mensajes',
        loadComponent: () => import('./mensajes-privados/mensajes-privados.component').then(m => m.MensajesPrivadosComponent)
      },
      {
        path: 'calendario',
        loadComponent: () => import('./calendario-eventos/calendario-eventos.component').then(m => m.CalendarioEventosComponent)
      },
      {
        path: 'mentorias',
        loadComponent: () => import('./mentorias/mentorias.component').then(m => m.MentoriasComponent)
      },
      {
        path: '',
        redirectTo: 'foro',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComunidadRoutingModule { }