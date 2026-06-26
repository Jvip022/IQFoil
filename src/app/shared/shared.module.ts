import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importación de componentes standalone
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { BibliotecaOfflineComponent } from './biblioteca-offline/biblioteca-offline.component';
import { EstadoConexionComponent } from './estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from './modal-confirmacion/modal-confirmacion.component';

@NgModule({
  imports: [
    CommonModule,           
    RouterModule,          
    SidebarComponent,
    FooterComponent,
    BibliotecaOfflineComponent,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  exports: [
    
    CommonModule,
    RouterModule,
    
  
    SidebarComponent,
    FooterComponent,
    BibliotecaOfflineComponent,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ]
})
export class SharedModule { }