import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

// Interfaz para acciones pendientes (offline queue)
export interface PendingAction {
  id: string;
  action: string;
  data: any;
  timestamp: number;
}

// Interfaz para documentos almacenados offline
export interface OfflineDocument {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'text' | 'video';
  url?: string;
  content?: string;
  size: number;
  lastModified: Date;
  synced: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  // ========== Estado de conexión y cola de acciones ==========
  private onlineStatus$ = new BehaviorSubject<boolean>(navigator.onLine);
  private pendingActions: PendingAction[] = [];
  private storageKey = 'offline_pending';

  // ========== Documentos offline (mock) ==========
  private documentsMock: OfflineDocument[] = [
    {
      id: '1',
      title: 'Reglamento de Vela 2024',
      type: 'pdf',
      url: '/assets/docs/reglamento.pdf',
      size: 2500000,
      lastModified: new Date('2024-01-15'),
      synced: true
    },
    {
      id: '2',
      title: 'Manual de Nudos',
      type: 'text',
      content: 'Contenido del manual...',
      size: 15000,
      lastModified: new Date('2024-02-10'),
      synced: true
    }
  ];

  constructor() {
    // Escuchar cambios de conexión
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(status => {
      this.onlineStatus$.next(status);
      if (status) {
        this.syncPendingActions();
      }
    });

    // Cargar acciones pendientes desde localStorage
    this.loadPendingActions();
  }

  // ========== Métodos de conexión ==========
  get connectionStatus$(): Observable<boolean> {
    return this.onlineStatus$.asObservable();
  }

  get isOnline(): boolean {
    return this.onlineStatus$.value;
  }

  // ========== Cola de acciones offline ==========
  queueAction(action: string, data: any): void {
    const pending: PendingAction = {
      id: this.generateId(),
      action,
      data,
      timestamp: Date.now()
    };
    this.pendingActions.push(pending);
    this.savePendingActions();
  }

  getPendingActions(): PendingAction[] {
    return [...this.pendingActions];
  }

  removePendingAction(id: string): void {
    this.pendingActions = this.pendingActions.filter(a => a.id !== id);
    this.savePendingActions();
  }

  syncPendingActions(): void {
    console.log('Sincronizando acciones pendientes:', this.pendingActions);
    // Aquí se implementaría la lógica real de sincronización
    this.pendingActions = [];
    this.savePendingActions();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private savePendingActions(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.pendingActions));
  }

  private loadPendingActions(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.pendingActions = JSON.parse(stored);
      } catch {
        this.pendingActions = [];
      }
    }
  }

  // ========== Métodos para documentos offline ==========
  getOfflineDocuments(): Observable<OfflineDocument[]> {
    return of(this.documentsMock).pipe(delay(500));
  }

  syncOfflineDocuments(): Observable<OfflineDocument[]> {
    // Simula sincronización
    this.documentsMock = this.documentsMock.map(doc => ({ ...doc, synced: true }));
    return of(this.documentsMock).pipe(delay(800));
  }
}