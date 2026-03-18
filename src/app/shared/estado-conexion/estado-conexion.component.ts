import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, fromEvent, merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-estado-conexion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estado-conexion.component.html',
  styleUrls: ['./estado-conexion.component.scss'] // Nota: styleUrls, no styleUrl
})
export class EstadoConexionComponent implements OnInit, OnDestroy {
  @Input() showReconnectHint = true; // Opción para mostrar texto de reconexión

  isOnline = navigator.onLine;
  private connectionSub?: Subscription;

  get statusText(): string {
    return this.isOnline ? 'Conectado' : 'Sin conexión';
  }

  ngOnInit(): void {
    // Escucha cambios en la conexión
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));
    this.connectionSub = merge(online$, offline$)
      .pipe(startWith(navigator.onLine))
      .subscribe(isOnline => {
        this.isOnline = isOnline;
      });
  }

  ngOnDestroy(): void {
    this.connectionSub?.unsubscribe();
  }

  checkConnection(): void {
    // Forzar verificación (opcional, ya que el navegador emite eventos)
    // Podría hacer un ping a un recurso confiable
    console.log('Verificando conexión...');
    // Simplemente actualizamos el estado actual (los eventos ya deberían ocurrir)
    // Pero si quieres forzar una comprobación, puedes hacer un fetch a una API
    // Por simplicidad, solo actualizamos la propiedad
    this.isOnline = navigator.onLine;
  }
}