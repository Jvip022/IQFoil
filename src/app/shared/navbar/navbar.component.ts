import { Component, HostListener, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

// Interfaz local para tipar el objeto usuario (ajústala según la estructura real)
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

  isAuthenticated = false;
  userName = 'Usuario';
  userInitials = 'US';
  userAvatar: string | null = null;

  private authSubscription?: Subscription;

  @ViewChild('userMenuTrigger') userMenuTrigger!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Asumimos que getAuthStatus() devuelve un Observable<boolean>
    this.authSubscription = this.authService.getAuthStatus().subscribe((status: boolean) => {
      this.isAuthenticated = status;
      if (status) {
        // Obtén el usuario según la API real de AuthService:
        // Puede ser this.authService.getUser(), this.authService.getCurrentUser(),
        // o una propiedad como this.authService.currentUser.
        // Aquí usamos un acceso opcional para evitar errores si el método no existe.
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
    this.isScrolled = window.scrollY > 10;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.isUserMenuOpen && !this.userMenuTrigger.nativeElement.contains(event.target)) {
      this.closeUserMenu();
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