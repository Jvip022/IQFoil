import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'lista-videos',
        loadComponent: () => import('./lista-videos/lista-videos.component').then(m => m.ListaVideosComponent)
      },
      {
        path: 'certificado',
        loadComponent: () => import('./certificado/certificado.component').then(m => m.CertificadoComponent)
      },
      {
        path: 'progreso-modulo',
        loadComponent: () => import('./progreso-modulo/progreso-modulo.component').then(m => m.ProgresoModuloComponent)
      },
      {
        path: 'reproductor-video',
        loadComponent: () => import('./reproductor-video/reproductor-video.component').then(m => m.ReproductorVideoComponent)
      },
      {
        path: '',
        redirectTo: 'lista-videos',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContenidosRoutingModule { }