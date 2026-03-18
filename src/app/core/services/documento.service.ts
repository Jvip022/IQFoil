import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Documento {
  id: string;
  titulo: string;
  descripcion: string;
  archivoUrl: string;
  tipo: 'pdf' | 'word' | 'excel' | 'imagen' | 'video' | 'otro';
  fechaSubida: Date;
  tamano: number; // en bytes
  autor: string;
  version?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private documentosMock: Documento[] = [
    {
      id: '1',
      titulo: 'Reglamento de vela 2024',
      descripcion: 'Reglas oficiales de la competición',
      archivoUrl: '/assets/docs/reglamento.pdf',
      tipo: 'pdf',
      fechaSubida: new Date('2024-01-15'),
      tamano: 2500000,
      autor: 'Federación',
      version: 2
    },
    {
      id: '2',
      titulo: 'Plan de entrenamiento básico',
      descripcion: 'Guía para principiantes',
      archivoUrl: '/assets/docs/plan.pdf',
      tipo: 'pdf',
      fechaSubida: new Date('2024-02-10'),
      tamano: 1800000,
      autor: 'Comité Técnico'
    }
  ];

  constructor() {}

  /** Obtiene todos los documentos */
  getDocumentos(): Observable<Documento[]> {
    return of(this.documentosMock).pipe(delay(500));
  }

  /** Obtiene un documento por su id */
  getDocumento(id: string): Observable<Documento | undefined> {
    const doc = this.documentosMock.find(d => d.id === id);
    return of(doc).pipe(delay(200));
  }

  /** Sube un nuevo documento (simulado) */
  subirDocumento(documento: Partial<Documento>, archivo: File): Observable<Documento> {
    const nuevoDoc: Documento = {
      id: Date.now().toString(),
      titulo: documento.titulo || 'Sin título',
      descripcion: documento.descripcion || '',
      archivoUrl: URL.createObjectURL(archivo), // simulación
      tipo: documento.tipo || 'otro',
      fechaSubida: new Date(),
      tamano: archivo.size,
      autor: documento.autor || 'Usuario actual',
      version: documento.version || 1
    };
    this.documentosMock.push(nuevoDoc);
    return of(nuevoDoc).pipe(delay(800));
  }

  /** Elimina un documento */
  eliminarDocumento(id: string): Observable<boolean> {
    this.documentosMock = this.documentosMock.filter(d => d.id !== id);
    return of(true).pipe(delay(300));
  }

  /** Actualiza un documento existente */
  actualizarDocumento(id: string, cambios: Partial<Documento>): Observable<Documento | undefined> {
    const doc = this.documentosMock.find(d => d.id === id);
    if (doc) {
      Object.assign(doc, cambios);
    }
    return of(doc).pipe(delay(400));
  }
}