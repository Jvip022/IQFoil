import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // ← mejora rendimiento
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  isCollapsed = this.collapsed;
  isMobileExpanded = false;
  user: User | null = null;
  userInitials = '';
  loadingUser = true;
  menuItems: MenuItem[] = []; // ← propiedad calculada, no getter

  private fullMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '📊',
      route: '/dashboard',
      exact: true
    },
    {
      label: 'Contenidos',
      icon: '🎥',
      children: [
        { label: 'Videoteca', icon: '🎬', route: '/contenidos/lista-videos' },
        { label: 'Certificados', icon: '📜', route: '/contenidos/certificado' },
        { label: 'Progreso de módulos', icon: '📈', route: '/contenidos/progreso-modulo' },
      ]
    },
    {
      label: 'Comunidad',
      icon: '👥',
      children: [
        { label: 'Foro', icon: '💬', route: '/comunidad/foro' },
        { label: 'Mensajes privados', icon: '✉️', route: '/comunidad/mensajes' },
        { label: 'Calendario', icon: '📅', route: '/comunidad/calendario' },
        { label: 'Mentorías', icon: '🤝', route: '/comunidad/mentorias' }
      ]
    },
    {
      label: 'Talentos',
      icon: '🌟',
      children: [
        { label: 'Insignias', icon: '🏅', route: '/talentos/insignias' },
        { label: 'Alertas', icon: '🔔', route: '/talentos/alertas' },
        { label: 'Recomendaciones', icon: '💡', route: '/talentos/recomendaciones' },
        { label: 'Métricas', icon: '📊', route: '/talentos/metricas' }
      ]
    },
    {
      label: 'Documentación',
      icon: '📄',
      children: [
        { label: 'Biblioteca', icon: '📚', route: '/documentacion/biblioteca' },
        { label: 'Buscador avanzado', icon: '🔍', route: '/documentacion/buscador' },
        { label: 'Calculadora de ajustes', icon: '⚙️', route: '/documentacion/calculadora' },
        { label: 'Comparador de versiones', icon: '🔄', route: '/documentacion/comparador' },
        { label: 'Guía visual', icon: '🖼️', route: '/documentacion/guia' },
        { label: 'Visor PDF', icon: '📑', route: '/documentacion/visor-pdf' }
      ]
    },
    {
      label: 'Evaluación',
      icon: '📝',
      children: [
        { label: 'Lista de evaluaciones', icon: '📋', route: '/evaluacion/lista' },
        { label: 'Realizar evaluación', icon: '✍️', route: '/evaluacion/realizar' },
        { label: 'Gestionar rúbricas', icon: '✍️', route: '/evaluacion/rubricas' },
        { label: 'Reporte de progreso', icon: '📈', route: '/evaluacion/reporte' },
        { label: 'Subir video práctica', icon: '🎥', route: '/evaluacion/subir' }
      ]
    },
    {
      label: 'Simulaciones',
      icon: '🎮',
      children: [
        { label: 'Simulador de foil', icon: '🛸', route: '/simulaciones/simulador' }
      ]
    },
    {
      label: 'Administración',
      icon: '⚙️',
      children: [
        { label: 'Estadísticas', icon: '📊', route: '/administracion/estadisticas' },
        { label: 'Usuarios', icon: '👥', route: '/administracion/usuarios' },
        { label: 'Moderación', icon: '🛡️', route: '/administracion/moderacion' },
        { label: 'Configuración', icon: '⚙️', route: '/administracion/configuracion' },
        { label: 'Gestión de contenido', icon: '📦', route: '/administracion/contenido' },
        { label: 'Ver reportes', icon: '📋', route: '/administracion/reportes' }
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Cargar usuario si hay token
    if (this.authService.isAuthenticated()) {
      this.authService.getUser().subscribe();
    }

    // Suscribirse a cambios del usuario
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.loadingUser = false;
      const displayName = user?.nombre || user?.displayName;
      this.userInitials = this.getInitials(displayName);
      // Actualizar menú cuando el usuario cambia
      this.updateMenuItems();
      this.cdr.detectChanges();
    });

    // Reaccionar a cambios en autenticación
    this.authService.getAuthStatus().subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.user = null;
        this.userInitials = '';
        this.loadingUser = false;
        this.menuItems = []; // Vaciar menú al cerrar sesión
        this.cdr.detectChanges();
      }
    });
  }

  private updateMenuItems(): void {
    const roles = this.user?.roles || [];
    const isAdmin = roles.includes('admin');
    const isEntrenador = roles.includes('entrenador');
    const isAtleta = roles.includes('atleta');

    this.menuItems = this.fullMenuItems
      .map(item => {
        if (item.children) {
          let filteredChildren = item.children;

          // Filtro para Administración
          if (item.label === 'Administración') {
            if (isAdmin) {
              filteredChildren = item.children;
            } else if (isEntrenador) {
              filteredChildren = item.children.filter(child =>
                child.label === 'Configuración' || child.label === 'Ver reportes'
              );
            } else if (isAtleta) {
              filteredChildren = item.children.filter(child =>
                child.label === 'Configuración'
              );
            } else {
              filteredChildren = [];
            }
          }

          // Filtro para Evaluación
          if (item.label === 'Evaluación') {
            if (isAdmin || isEntrenador) {
              filteredChildren = item.children;
            } else if (isAtleta) {
              filteredChildren = item.children.filter(child =>
                child.label === 'Realizar evaluación' || child.label === 'Subir video práctica'
              );
            } else {
              filteredChildren = [];
            }
          }

          if (filteredChildren.length === 0) {
            return null;
          }

          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter(item => item !== null) as MenuItem[];
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