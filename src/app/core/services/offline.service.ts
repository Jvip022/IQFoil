// src/app/core/services/offline.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface PendingAction {
  id: string;
  action: string;
  data: any;
  timestamp: number;
}

export interface OfflineDocument {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'text' | 'video';
  url?: string;
  content?: string;
  size: number;
  lastModified: Date;
  synced: boolean;
  base64Data?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private onlineStatus$ = new BehaviorSubject<boolean>(navigator.onLine);
  private pendingActions: PendingAction[] = [];
  private storageKey = 'offline_pending';
  private docsStorageKey = 'offline_documents';

  // Inicializar con algunos documentos mock, pero se pueden agregar más
  private defaultDocuments: OfflineDocument[] = [
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
      content: 'Contenido del manual de nudos...',
      size: 15000,
      lastModified: new Date('2024-02-10'),
      synced: true
    }
  ];

  constructor() {
    // Cargar documentos desde localStorage o usar los default
    this.loadDocuments();

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

    this.loadPendingActions();
  }

  // ========== Documentos offline ==========
  private loadDocuments(): void {
    const stored = localStorage.getItem(this.docsStorageKey);
    if (stored) {
      try {
        const docs = JSON.parse(stored);
        // Convertir fechas de string a Date
        this.documents = docs.map((d: any) => ({
          ...d,
          lastModified: new Date(d.lastModified)
        }));
        return;
      } catch { /* ignore */ }
    }
    // Si no hay stored o hay error, usar default
    this.documents = this.defaultDocuments;
    this.saveDocuments();
  }

  private documents: OfflineDocument[] = [];

  private saveDocuments(): void {
    localStorage.setItem(this.docsStorageKey, JSON.stringify(this.documents));
  }

  getOfflineDocuments(): Observable<OfflineDocument[]> {
    return of(this.documents).pipe(delay(300));
  }

  addOfflineDocument(doc: OfflineDocument): void {
    // Evitar duplicados por id
    const existing = this.documents.find(d => d.id === doc.id);
    if (existing) {
      Object.assign(existing, doc);
    } else {
      this.documents.push(doc);
    }
    this.saveDocuments();
  }

  removeOfflineDocument(id: string): void {
    this.documents = this.documents.filter(d => d.id !== id);
    this.saveDocuments();
  }

  syncOfflineDocuments(): Observable<OfflineDocument[]> {
    // Aquí se podría llamar al backend para obtener documentos actualizados
    // Por ahora, solo marcamos como sincronizados
    this.documents = this.documents.map(d => ({ ...d, synced: true }));
    this.saveDocuments();
    return of(this.documents).pipe(delay(500));
  }

  // ========== Estado de conexión ==========
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
    // Aquí se enviarían al backend
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
}