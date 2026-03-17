import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <header>
        <h1>Dashboard</h1>
        <button (click)="logout()">Cerrar Sesión</button>
      </header>
      <div class="content">
        <h2>Bienvenido, {{ user?.name || user?.email }}</h2>
        <p>Has iniciado sesión correctamente.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 20px; }
    header { display: flex; justify-content: space-between; align-items: center; }
    button { padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  user: any;

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
  }
}