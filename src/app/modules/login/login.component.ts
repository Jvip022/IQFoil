import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Iniciar sesión</h2>
      <form #loginForm="ngForm" (ngSubmit)="onSubmit()">
        <div>
          <label>Usuario:</label>
          <input type="text" [(ngModel)]="username" name="username" required>
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" [(ngModel)]="password" name="password" required>
        </div>
        <button type="submit" [disabled]="loginForm.invalid">Entrar</button>
      </form>
      <p *ngIf="error" class="error">{{ error }}</p>
    </div>
  `,
  styles: [`
    .login-container { max-width: 300px; margin: 50px auto; }
    .error { color: red; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.authService.login(this.username, this.password).subscribe(success => {
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error = 'Credenciales incorrectas';
      }
    });
  }
}