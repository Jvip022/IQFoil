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
  roles?: string[];
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
    { label: 'Administración', link: '/administracion', icon: '⚙️', roles: ['admin'] },
  ];
  accesosVisibles: Array<any> = [];

  ngOnInit(): void {
    // Usuario
    this.user$ = this.authService.currentUser$ || of(null);

    // Rol
    this.role$ = this.user$.pipe(
      map((u: any) => {
        if (!u) return null;
        if (Array.isArray(u.roles) && u.roles.length > 0) return u.roles[0];
        return u.role || null;
      })
    );

    // Estado de conexión
    this.isOnline$ = this.offlineService.connectionStatus$ || of(true);

    // Notificaciones no leídas (mock)
    this.unreadCount$ = this.user$.pipe(
      switchMap((u: any): Observable<number> => {
        if (!u) return of(0);
        // Si el servicio tiene método, usarlo
        const method = (this.notificacionService as any).getUnreadCount;
        return method ? method() : of(3); // mock
      }),
      catchError(() => of(0))
    );

    // Últimas notificaciones (mock)
    this.ultimasNotificaciones$ = this.user$.pipe(
      switchMap((u: any): Observable<any[]> => {
        if (!u) return of([]);
        const method = (this.notificacionService as any).fetchLatest;
        return method ? method(5) : of([
          { titulo: 'Bienvenido', resumen: 'Gracias por usar la plataforma', link: '/dashboard' },
          { titulo: 'Nuevo contenido', resumen: 'Se ha añadido un nuevo video', link: '/contenidos' }
        ]);
      }),
      catchError(() => of([]))
    );

    // Recomendaciones (usando el servicio real o mock)
    this.recomendaciones$ = this.user$.pipe(
      switchMap((u: any): Observable<any[]> => {
        if (!u) return of([]);
        // TalentoService tiene getRecomendaciones(usuarioId)
        const method = (this.talentoService as any).getRecomendaciones;
        if (method) {
          return method(u.uid).pipe(
            map((recs: any[]) => recs || []),
            catchError(() => of([]))
          );
        }
        // Mock
        return of([
          { tipo: 'curso', titulo: 'Técnica de foils', nivel: 'intermedio', id: 1 },
          { tipo: 'video', titulo: 'Virada en ceñida', nivel: 'principiante', id: 11 }
        ]);
      }),
      catchError(() => of([]))
    );

    // Estadísticas / Progreso (mock + datos reales si existen)
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

        // Usar ContenidoService.getModulos() para calcular progreso real
        return this.contenidoService.getModulos().pipe(
          map((modulos: any[]) => {
            const videos = modulos.flatMap((m: any) => m.videos || []);
            const total = videos.length;
            const vistos = videos.filter((v: any) => v.progreso === 100).length;
            const global = total > 0 ? Math.round((vistos / total) * 100) : 0;
            // Evolución simulada (últimos 6 meses)
            const evolucion = [
              { fecha: 'Ene', valor: Math.max(0, global - 20) },
              { fecha: 'Feb', valor: Math.max(0, global - 15) },
              { fecha: 'Mar', valor: Math.max(0, global - 10) },
              { fecha: 'Abr', valor: Math.max(0, global - 5) },
              { fecha: 'May', valor: Math.max(0, global) },
              { fecha: 'Jun', valor: global }
            ];
            // Insignias: obtener de TalentoService si existe
            let insignias = 0;
            const badgeMethod = (this.talentoService as any).getInsignias;
            if (badgeMethod) {
              // Simulación: contar insignias obtenidas
              badgeMethod().subscribe((ins: any[]) => {
                insignias = ins.filter((i: any) => i.obtenida).length;
              });
            }
            return {
              globalProgress: global,
              videosVistos: vistos,
              videosTotales: total,
              evaluacionesCompletadas: 0, // No hay endpoint, mock
              insignias: insignias || 2,
              evolucion: evolucion
            };
          }),
          catchError(() => {
            // Si falla, datos mock
            return of({
              globalProgress: 45,
              videosVistos: 6,
              videosTotales: 12,
              evaluacionesCompletadas: 3,
              insignias: 2,
              evolucion: [
                { fecha: 'Ene', valor: 30 },
                { fecha: 'Feb', valor: 35 },
                { fecha: 'Mar', valor: 40 },
                { fecha: 'Abr', valor: 42 },
                { fecha: 'May', valor: 45 },
                { fecha: 'Jun', valor: 48 }
              ]
            });
          })
        );
      })
    );

    // Datos específicos por rol (mock)
    this.proximosEventos$ = this.user$.pipe(
      switchMap((u: any): Observable<any[]> => {
        if (!u) return of([]);
        return of([
          { fecha: new Date(Date.now() + 7 * 86400000), titulo: 'Regata de primavera' },
          { fecha: new Date(Date.now() + 14 * 86400000), titulo: 'Entrenamiento de foil' }
        ]);
      }),
      catchError(() => of([]))
    );

    this.mentor$ = this.user$.pipe(
      switchMap((u: any): Observable<any | null> => {
        if (!u) return of(null);
        return of({ nombre: 'Carlos Gómez', contacto: 'carlos@iqfoil.cu' });
      }),
      catchError(() => of(null))
    );

    this.atletasACargo$ = this.user$.pipe(
      switchMap((u: any): Observable<any[]> => {
        if (!u) return of([]);
        return of([
          { nombre: 'Juan Pérez', progreso: 75 },
          { nombre: 'María García', progreso: 60 },
          { nombre: 'Luis Fernández', progreso: 40 }
        ]);
      }),
      catchError(() => of([]))
    );

    this.evaluacionesPendientes$ = this.user$.pipe(
      switchMap((u: any): Observable<any[]> => {
        if (!u) return of([]);
        return of([
          { titulo: 'Evaluación de técnica', atleta: 'Juan Pérez' },
          { titulo: 'Evaluación de reglamento', atleta: 'María García' }
        ]);
      }),
      catchError(() => of([]))
    );

    this.adminStats$ = this.role$.pipe(
      switchMap((role): Observable<any> => {
        if (role !== 'admin') return of(null);
        return of({ usuariosActivos: 12, contenidoTop: 'Introducción al foil' });
      }),
      catchError(() => of(null))
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

  // CORRECCIÓN DE RUTAS
  goToNotifications(): void {
    // Redirigir a Comunidad -> Mensajes privados (si existe) o al dashboard
    this.router.navigate(['/comunidad/mensajes']).catch(() => {
      // Si la ruta no existe, ir a dashboard
      this.router.navigate(['/dashboard']);
    });
  }

  goToAdmin(): void {
    this.router.navigate(['/administracion']);
  }

  openContent(item: any): void {
    if (!item) return;
    // Si es un curso o video, redirigir a contenidos
    this.router.navigate(['/contenidos', item.id || 'lista-videos']);
  }

  openNotification(n: any): void {
    if (!n) return;
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