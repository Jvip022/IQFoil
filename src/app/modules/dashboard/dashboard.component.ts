import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { takeUntil, map, switchMap, catchError } from 'rxjs/operators';

import { AuthService } from 'src/app/core/services/auth.service';
import { ContenidoService } from 'src/app/core/services/contenido.service';
import { TalentoService } from 'src/app/core/services/talento.service';
import { NotificacionService } from 'src/app/core/services/notificacion.service';
import { OfflineService } from 'src/app/core/services/offline.service';

import { EstadoConexionComponent } from 'src/app/shared/estado-conexion/estado-conexion.component';
import { BibliotecaOfflineComponent } from 'src/app/shared/biblioteca-offline/biblioteca-offline.component';

import { Chart, ChartConfiguration } from 'chart.js';

interface User {
  uid?: string;
  nombre?: string;
  displayName?: string;
  avatarUrl?: string;
  roles?: string[]; // ej. ['atleta']
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, EstadoConexionComponent, BibliotecaOfflineComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private authService: AuthService,
    private contenidoService: ContenidoService,
    private talentoService: TalentoService,
    private notificacionService: NotificacionService,
    private offlineService: OfflineService,
    private router: Router
  ) {}

  @ViewChild('evolutionCanvas') evolutionCanvas!: ElementRef<HTMLCanvasElement>;
  private evolutionChart?: Chart;

  // Observables públicos
  user$!: Observable<User | null>;
  role$!: Observable<string | null>;
  isOnline$!: Observable<boolean>;
  unreadCount$!: Observable<number>;
  ultimasNotificaciones$!: Observable<any[]>;
  recomendaciones$!: Observable<any[]>;
  stats$!: Observable<any>;
  proximosEventos$!: Observable<any[]>;
  mentor$!: Observable<any | null>;
  atletasACargo$!: Observable<any[]>;
  evaluacionesPendientes$!: Observable<any[]>;
  adminStats$!: Observable<any>;

  private destroyed$ = new Subject<void>();

  /* Accesos rápidos */
  accesos = [
    { label: 'Contenidos', link: '/contenidos', icon: '📚', roles: ['atleta', 'entrenador', 'admin'] },
    { label: 'Documentación', link: '/documentacion', icon: '📄', roles: ['atleta', 'entrenador', 'admin'] },
    { label: 'Comunidad', link: '/comunidad', icon: '💬', roles: ['atleta', 'entrenador', 'admin'] },
    { label: 'Evaluación', link: '/evaluacion', icon: '📝', roles: ['atleta', 'entrenador'] },
    { label: 'Talentos', link: '/talentos', icon: '🏆', roles: ['entrenador', 'admin'] },
    { label: 'Simulaciones', link: '/simulaciones', icon: '⚙️', roles: ['atleta', 'entrenador', 'admin'] },
  ];
  accesosVisibles: Array<any> = [];

  ngOnInit(): void {
    // Usuario
    this.user$ =
      (this.authService as any).currentUser$ ||
      (this.authService as any).user$ ||
      of((this.authService as any).getCurrentUser ? (this.authService as any).getCurrentUser() : null);

    // Rol
    this.role$ = this.user$.pipe(
      map((u: any) => {
        if (!u) return null;
        if (Array.isArray(u.roles) && u.roles.length > 0) return u.roles[0];
        return u.role || null;
      })
    );

    // Estado de conexión
    this.isOnline$ = (this.offlineService as any).isOnline$ || (this.offlineService as any).online$ || of(true);

    // Notificaciones no leídas
    this.unreadCount$ = ((this.notificacionService as any).unreadCount$ as Observable<number>) || this.user$.pipe(
      switchMap((u: any): Observable<number> => {
        if (!u) return of(0);
        const method = (this.notificacionService as any).getUnreadCount;
        return method ? method(u.uid) : of(0);
      }),
      catchError(() => of(0))
    );

    // Últimas notificaciones
    this.ultimasNotificaciones$ = this.user$.pipe(
      switchMap((u: any): Observable<any[]> => {
        if (!u) return of([]);
        const fetchMethod = (this.notificacionService as any).fetchLatest || (this.notificacionService as any).getLatest;
        return fetchMethod ? fetchMethod(u.uid, { limit: 10 }) : of([]);
      }),
      catchError(() => of([]))
    );

    // Recomendaciones
    this.recomendaciones$ = this.user$.pipe(
      switchMap((u: any): Observable<any[]> => {
        if (!u) return of([]);
        const recMethod = (this.talentoService as any).getRecommendations || (this.talentoService as any).recommendationsFor;
        return recMethod ? recMethod(u.uid) : of([]);
      }),
      catchError(() => of([]))
    );

    // Estadísticas / Progreso
    this.stats$ = this.user$.pipe(
      switchMap((u: any) => {
        if (!u) {
          return of({
            globalProgress: 0,
            videosVistos: 0,
            videosTotales: 0,
            evaluacionesCompletadas: 0,
            insignias: 0,
            evolucion: []
          });
        }

        const progreso$ = (this.contenidoService as any).getProgresoUsuario?.(u.uid) || of(null);
        const badges$ = (this.talentoService as any).getUserBadges?.(u.uid) || of([]);

        return combineLatest([progreso$, badges$]).pipe(
          map(([prog, badges]: any) => {
            const global = prog?.globalProgress ?? 0;
            return {
              globalProgress: Math.round(global),
              videosVistos: prog?.videosVistos ?? 0,
              videosTotales: prog?.videosTotales ?? 0,
              evaluacionesCompletadas: prog?.evaluacionesCompletadas ?? 0,
              insignias: (badges || []).length,
              evolucion: prog?.evolucion ?? []
            };
          }),
          catchError(() => of({
            globalProgress: 0,
            videosVistos: 0,
            videosTotales: 0,
            evaluacionesCompletadas: 0,
            insignias: 0,
            evolucion: []
          }))
        );
      })
    );

    // Datos específicos por rol
    this.proximosEventos$ = this.user$.pipe(
      switchMap((u: any): Observable<any[]> => (u ? (this.contenidoService as any).getUpcomingEventsForUser?.(u.uid) || of([]) : of([]))),
      catchError(() => of([]))
    );

    this.mentor$ = this.user$.pipe(
      switchMap((u: any): Observable<any | null> => (u ? (this.talentoService as any).getMentorFor?.(u.uid) || of(null) : of(null))),
      catchError(() => of(null))
    );

    this.atletasACargo$ = this.user$.pipe(
      switchMap((u: any): Observable<any[]> => (u ? (this.talentoService as any).getAtletasForCoach?.(u.uid) || of([]) : of([]))),
      catchError(() => of([]))
    );

    this.evaluacionesPendientes$ = this.user$.pipe(
      switchMap((u: any): Observable<any[]> => (u ? (this.talentoService as any).getPendingEvaluationsForCoach?.(u.uid) || of([]) : of([]))),
      catchError(() => of([]))
    );

    this.adminStats$ = this.role$.pipe(
      switchMap((role): Observable<any> => {
        if (role !== 'admin') return of(null);
        return (this.contenidoService as any).getAdminStats?.() || of({ usuariosActivos: 0, contenidoTop: '—' });
      }),
      catchError(() => of({ usuariosActivos: 0, contenidoTop: '—' }))
    );

    // Filtrar accesos según rol
    combineLatest([this.role$, of(this.accesos)])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([role, accesos]) => {
        if (!role) {
          this.accesosVisibles = accesos.filter(a => a.roles.includes('atleta') || a.roles.includes('entrenador') || a.roles.includes('admin'));
          return;
        }
        this.accesosVisibles = accesos.filter((a: any) => a.roles.includes(role) || a.roles.includes('admin'));
      });
  }

  ngAfterViewInit(): void {
    this.stats$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((s: any) => {
        if (!s || !s.evolucion || s.evolucion.length === 0) {
          this.destroyChart();
          return;
        }
        this.buildChart(s.evolucion);
      });
  }

  private buildChart(evol: Array<{ fecha: string; valor: number }>): void {
    try {
      if (!this.evolutionCanvas) return;
      const ctx = this.evolutionCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      const labels = evol.map(e => e.fecha);
      const data = evol.map(e => e.valor);

      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Progreso',
              data,
              fill: true,
              tension: 0.25,
              borderWidth: 2,
              pointRadius: 3,
            } as any
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { display: true },
            y: { beginAtZero: true, max: 100 }
          }
        }
      };

      this.destroyChart();
      this.evolutionChart = new Chart(ctx, config);
    } catch (err) {
      console.warn('No se pudo inicializar el gráfico de evolución:', err);
    }
  }

  private destroyChart(): void {
    if (this.evolutionChart) {
      try { this.evolutionChart.destroy(); } catch { /* noop */ }
      this.evolutionChart = undefined;
    }
  }

  goToNotifications(): void {
    this.router.navigate(['/notificaciones']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  openContent(item: any): void {
    if (!item) return;
    this.router.navigate(['/contenidos', item.id]);
  }

  openNotification(n: any): void {
    if (!n) return;
    (this.notificacionService as any).markAsRead?.(n.id).catch(() => null);
    if (n.link) {
      this.router.navigateByUrl(n.link);
    }
  }

  getInitials(u: any): string {
    const name = u?.displayName || u?.nombre || '';
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.destroyChart();
  }
}