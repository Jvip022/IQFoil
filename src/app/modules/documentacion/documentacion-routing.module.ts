import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { autenticacionGuard } from '../../core/guards/autenticacion.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [autenticacionGuard],
    children: [
      {
        path: 'biblioteca',
        loadComponent: () => import('./biblioteca-documentos/biblioteca-documentos.component').then(m => m.BibliotecaDocumentosComponent)
      },
      {
        path: 'buscador',
        loadComponent: () => import('./buscador-avanzado/buscador-avanzado.component').then(m => m.BuscadorAvanzadoComponent)
      },
      {
        path: 'calculadora',
        loadComponent: () => import('./calculadora-ajustes/calculadora-ajustes.component').then(m => m.CalculadoraAjustesComponent)
      },
      {
        path: 'comparador',
        loadComponent: () => import('./comparador-versiones/comparador-versiones.component').then(m => m.ComparadorVersionesComponent)
      },
      {
        path: 'guia',
        loadComponent: () => import('./guia-visual/guia-visual.component').then(m => m.GuiaVisualComponent)
      },
      {
        path: 'visor-pdf',
        loadComponent: () => import('./visor-pdf/visor-pdf.component').then(m => m.VisorPdfComponent)
      },
      {
        path: '',
        redirectTo: 'biblioteca',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentacionRoutingModule { }