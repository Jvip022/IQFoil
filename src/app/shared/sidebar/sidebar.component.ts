import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  route?: string;               // opcional si tiene hijos
  label: string;
  icon: string;
  exact?: boolean;
  children?: MenuItem[];
  expanded?: boolean;           // para controlar apertura/cierre
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
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  isCollapsed = this.collapsed;
  isMobileExpanded = false;
  user: User | null = null;
  userInitials = '';

  menuItems: MenuItem[] = [
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
        { label: 'Videoteca', icon: '🎬', route: '/contenidos/lista-videos', exact: false },
        { label: 'Certificados', icon: '📜', route: '/contenidos/certificado', exact: false  },
        { label: 'Progreso de módulos', icon: '📈', route: '/contenidos/progreso-modulo', exact: false  },
        { label: 'Reproductor', icon: '▶️', route: '/contenidos/reproductor-video', exact: false  }
      ]
    },
    {
      label: 'Comunidad',
      icon: '👥',
      children: [
        { label: 'Foro', icon: '💬', route: '/comunidad/foro', exact: false  },
        { label: 'Mensajes privados', icon: '✉️', route: '/comunidad/mensajes', exact: false  },
        { label: 'Calendario', icon: '📅', route: '/comunidad/calendario', exact: false  },
        { label: 'Mentorías', icon: '🤝', route: '/comunidad/mentorias', exact: false  }
      ]
    },
    {
      label: 'Talentos',
      icon: '🌟',
      children: [
        { label: 'Insignias', icon: '🏅', route: '/talentos/insignias', exact: false  },
        { label: 'Alertas', icon: '🔔', route: '/talentos/alertas', exact: false  },
        { label: 'Recomendaciones', icon: '💡', route: '/talentos/recomendaciones', exact: false  },
        { label: 'Métricas', icon: '📊', route: '/talentos/metricas' , exact: false }
      ]
    },
    {
      label: 'Documentación',
      icon: '📄',
      children: [
        { label: 'Biblioteca', icon: '📚', route: '/documentacion/biblioteca' , exact: false },
        { label: 'Buscador avanzado', icon: '🔍', route: '/documentacion/buscador', exact: false  },
        { label: 'Calculadora de ajustes', icon: '⚙️', route: '/documentacion/calculadora', exact: false  },
        { label: 'Comparador de versiones', icon: '🔄', route: '/documentacion/comparador', exact: false  },
        { label: 'Guía visual', icon: '🖼️', route: '/documentacion/guia' , exact: false },
        { label: 'Visor PDF', icon: '📑', route: '/documentacion/visor-pdf' , exact: false }
      ]
    },
    {
      label: 'Evaluación',
      icon: '📝',
      children: [
        { label: 'Lista de evaluaciones', icon: '📋', route: '/evaluacion/lista', exact: false  },
        { label: 'Realizar evaluación', icon: '✍️', route: '/evaluacion/realizar' , exact: false },
        { label: 'Gestion rubricas', icon: '✍️', route: '/evaluacion/gestion' , exact: false },
        { label: 'Rúbricas', icon: '📊', route: '/evaluacion/rubricas', exact: false  },
        { label: 'Reporte de progreso', icon: '📈', route: '/evaluacion/reporte', exact: false  }
      ]
    },
    {
      label: 'Simulaciones',
      icon: '🎮',
      children: [
        { label: 'Simulador de foil', icon: '🛸', route: '/simulaciones/simulador' , exact: false }
      ]
    },
    {
      label: 'Administración',
      icon: '⚙️',
      children: [
        { label: 'Estadísticas', icon: '📊', route: '/administracion/estadisticas' , exact: false },
        { label: 'Usuarios', icon: '👥', route: '/administracion/usuarios' , exact: false },
        { label: 'Moderación', icon: '🛡️', route: '/administracion/moderacion' , exact: false },
        { label: 'Configuración', icon: '⚙️', route: '/administracion/configuracion' , exact: false },
        { label: 'Gestión de contenido', icon: '📦', route: '/administracion/contenido' , exact: false }
      ]
    }
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

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
    if (!this.isCollapsed) {
      this.isMobileExpanded = true;
    }
  }

  toggleMobile(): void {
    this.isMobileExpanded = !this.isMobileExpanded;
  }

  toggleSubmenu(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
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