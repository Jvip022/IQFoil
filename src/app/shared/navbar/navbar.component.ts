import { Component, HostListener, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

interface User {
  name: string;
  avatar?: string | null;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isUserMenuOpen = false;
  isScrolled = false;
  isHidden = false; // Para ocultar/mostrar por scroll

  isAuthenticated = false;
  userName = 'Usuario';
  userInitials = 'US';
  userAvatar: string | null = null;

  private authSubscription?: Subscription;
  private lastScrollY = 0;
  private readonly HIDE_THRESHOLD = 10; // píxeles de scroll para considerar dirección
  private readonly SHOW_ON_TOP_THRESHOLD = 50; // píxeles desde el borde superior para mostrar al hover/touch

  @ViewChild('userMenuTrigger') userMenuTrigger!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.getAuthStatus().subscribe((status: boolean) => {
      this.isAuthenticated = status;
      if (status) {
        const user = (this.authService as any).getUser?.() as User | undefined;
        if (user) {
          this.userName = user.name || 'Usuario';
          this.userInitials = this.getInitials(this.userName);
          this.userAvatar = user.avatar || null;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.scrollY;
    this.isScrolled = currentScrollY > 10;

    // Determinar dirección del scroll
    if (currentScrollY > this.lastScrollY && currentScrollY > this.HIDE_THRESHOLD) {
      // Scroll hacia abajo - ocultar navbar
      this.isHidden = true;
    } else if (currentScrollY < this.lastScrollY) {
      // Scroll hacia arriba - mostrar navbar
      this.isHidden = false;
    }
    this.lastScrollY = currentScrollY;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.isUserMenuOpen && !this.userMenuTrigger.nativeElement.contains(event.target)) {
      this.closeUserMenu();
    }
  }

  // Mostrar navbar cuando el mouse se acerca al borde superior
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (event.clientY < this.SHOW_ON_TOP_THRESHOLD) {
      this.isHidden = false;
    }
  }

  // Para móviles: mostrar navbar al tocar cerca del borde superior
  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    if (touch && touch.clientY < this.SHOW_ON_TOP_THRESHOLD) {
      this.isHidden = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeUserMenu();
    this.isMenuOpen = false;
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