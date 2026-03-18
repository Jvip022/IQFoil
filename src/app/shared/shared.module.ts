import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importación de componentes standalone
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { BibliotecaOfflineComponent } from './biblioteca-offline/biblioteca-offline.component';
import { EstadoConexionComponent } from './estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from './modal-confirmacion/modal-confirmacion.component';

@NgModule({
  imports: [
    CommonModule,           // Proporciona directivas como ngIf, ngFor
    RouterModule,           // Proporciona directivas como routerLink, router-outlet
    // Los componentes standalone se importan directamente en el array 'imports'
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    BibliotecaOfflineComponent,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  exports: [
    // Re-exportamos CommonModule y RouterModule para que los módulos que importen SharedModule
    // tengan acceso a estas directivas sin necesidad de importarlas individualmente.
    CommonModule,
    RouterModule,
    // Exportamos todos los componentes para que estén disponibles donde se importe SharedModule
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    BibliotecaOfflineComponent,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ]
})
export class SharedModule { }