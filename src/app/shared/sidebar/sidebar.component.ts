import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  route: string;
  label: string;
  icon: string;
  exact: boolean;
}

interface User {
  name: string;
  role: string;
  avatar?: string | null;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;

  isCollapsed = this.collapsed;       // controla estado colapsado (escritorio)
  isMobileExpanded = false;           // controla apertura manual en móvil
  user: User | null = null;
  userInitials = '';

  menuItems: MenuItem[] = [
    { route: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
    { route: '/contenidos', label: 'Contenidos', icon: '🎥', exact: false },
    { route: '/comunidad', label: 'Comunidad', icon: '👥', exact: false },
    { route: '/talentos', label: 'Talentos', icon: '🌟', exact: false },
    { route: '/documentacion', label: 'Documentación', icon: '📄', exact: false },
    { route: '/administracion', label: 'Administración', icon: '⚙️', exact: false },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getAuthStatus().subscribe((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        const userData = (this.authService as any).getUser?.() as User | undefined;
        if (userData) {
          this.user = userData;
          this.userInitials = this.getInitials(userData.name);
        }
      } else {
        this.user = null;
      }
    });
  }

  // Alterna colapso en escritorio (clase .sidebar--collapsed)
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    // Si se expande manualmente en escritorio, también reflejamos en móvil
    if (!this.isCollapsed) {
      this.isMobileExpanded = true;
    }
  }

  // Botón hamburguesa para móvil
  toggleMobile(): void {
    this.isMobileExpanded = !this.isMobileExpanded;
  }

  logout(): void {
    this.authService.logout();
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}