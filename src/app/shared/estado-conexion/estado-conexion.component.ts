// src/app/shared/estado-conexion/estado-conexion.component.ts
import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, fromEvent, merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-estado-conexion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estado-conexion.component.html',
  styleUrls: ['./estado-conexion.component.scss']
})
export class EstadoConexionComponent implements OnInit, OnDestroy {
  @Input() showReconnectHint = true;
  @Output() connectionChange = new EventEmitter<boolean>(); // Emite cuando cambia el estado

  isOnline = navigator.onLine;
  private connectionSub?: Subscription;

  get statusText(): string {
    return this.isOnline ? 'Conectado' : 'Sin conexión';
  }

  ngOnInit(): void {
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));
    this.connectionSub = merge(online$, offline$)
      .pipe(startWith(navigator.onLine))
      .subscribe(isOnline => {
        this.isOnline = isOnline;
        this.connectionChange.emit(isOnline);
        // Si se detecta offline, se puede mostrar una alerta (opcional)
        if (!isOnline) {
          console.warn('⚠️ El usuario se ha desconectado de internet.');
          // Aquí se podría emitir un evento o mostrar una notificación
          // pero ya lo maneja el componente visualmente.
        }
      });
  }

  ngOnDestroy(): void {
    this.connectionSub?.unsubscribe();
  }

  checkConnection(): void {
    this.isOnline = navigator.onLine;
    this.connectionChange.emit(this.isOnline);
    // Si está offline, mostrar un mensaje más visible
    if (!this.isOnline) {
      // Podrías usar un toast o notificación
      console.log('🔴 Sin conexión a internet');
    } else {
      console.log('🟢 Conexión restablecida');
    }
  }
}