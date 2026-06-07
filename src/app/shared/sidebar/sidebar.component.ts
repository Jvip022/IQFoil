import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

interface MenuItem {
  route?: string;
  label: string;
  icon: string;
  exact?: boolean;
  children?: MenuItem[];
  expanded?: boolean;
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
  @Output() collapsedChange = new EventEmitter<boolean>();

  isCollapsed = this.collapsed;
  isMobileExpanded = false;
  user: User | null = null;
  userInitials = '';

  menuItems: MenuItem[] = [

    { label: 'Dashboard', icon: '📊', route: '/dashboard', exact: true },
    {
      label: 'Contenidos', icon: '🎥', children: [
        { label: 'Videoteca', icon: '🎬', route: '/contenidos/lista-videos' },
        { label: 'Certificados', icon: '📜', route: '/contenidos/certificado' },
        { label: 'Progreso de módulos', icon: '📈', route: '/contenidos/progreso-modulo' },
        { label: 'Reproductor', icon: '▶️', route: '/contenidos/reproductor-video' }
      ]
    },

  ];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      const displayName = user?.nombre || user?.displayName;
      this.userInitials = this.getInitials(displayName);
    });

    this.authService.getAuthStatus().subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.user = null;
        this.userInitials = '';
      }
    });
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
    if (!this.isCollapsed) this.isMobileExpanded = true;
  }

  toggleMobile(): void {
    this.isMobileExpanded = !this.isMobileExpanded;
  }

  toggleSubmenu(item: MenuItem): void {
    if (item.children) item.expanded = !item.expanded;
  }

  logout(): void {
    this.authService.logout();
  }

  private getInitials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }
}