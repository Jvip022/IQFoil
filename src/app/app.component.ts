import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SharedModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'IQ-Foil';
  isSidebarCollapsed = true;
  private authSub?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Escuchar cambios en el estado del sidebar (opcional, si el sidebar emite eventos)
    // Por ahora, asumimos que el sidebar emite un evento 'collapsedChange'
  }

  onSidebarCollapsed(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }
}