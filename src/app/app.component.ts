// app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component'; // Ajusta la ruta según tu proyecto

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent], 
  templateUrl: './app.component.html', 
  styleUrls: ['./app.component.scss']  
})
export class AppComponent {
  title = 'mi-login-app';
}