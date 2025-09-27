import { Routes } from '@angular/router';
import { NoEncontradoComponent } from './navegacion/no-encontrado/no-encontrado.component';

export const routes: Routes = [
    { path: '**', redirectTo: 'no-econtrado' } // Ruta comodín para páginas no encontradas
];
