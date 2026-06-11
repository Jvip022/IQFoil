import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { environment } from '../../../environments/environment';

export interface Documento {
  id?: string;
  titulo: string;
  descripcion: string;
  archivoUrl: string;
  tipo: string;
  fechaSubida: Date;
  tamano: number;
  autor: string;
  version?: number;
}

@Injectable({ providedIn: 'root' })
export class DocumentoService {
  private apiUrl = environment.apiUrl;

  // Obtener la URL base del backend (sin /api) para archivos estáticos
  private get backendBaseUrl(): string {
    if (environment.backendUrl) {
      return environment.backendUrl;
    }
    // Fallback: eliminar '/api' del final de apiUrl
    return this.apiUrl.replace(/\/api$/, '');
  }

  constructor(private http: HttpClient) {}

  getDocumentos(): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.apiUrl}/documentos/`).pipe(
      map(docs => docs.map(doc => ({
        ...doc,
        fechaSubida: new Date(doc.fechaSubida),
        // Asegurar URL absoluta
        archivoUrl: this.toAbsoluteUrl(doc.archivoUrl)
      })))
    );
  }

  subirDocumento(documento: Partial<Documento>, archivo: File): Observable<Documento> {
    const formData = new FormData();
    formData.append('titulo', documento.titulo || '');
    formData.append('descripcion', documento.descripcion || '');
    formData.append('tipo', documento.tipo || 'pdf');
    formData.append('archivo', archivo);
    return this.http.post<Documento>(`${this.apiUrl}/documentos/`, formData);
  }

  eliminarDocumento(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documentos/${id}`);
  }

  actualizarDocumento(id: string, cambios: Partial<Documento>): Observable<Documento> {
    return this.http.put<Documento>(`${this.apiUrl}/documentos/${id}`, cambios);
  }

  // Convierte una ruta relativa o absoluta a URL completa
  private toAbsoluteUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Eliminar posibles barras iniciales duplicadas
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${this.backendBaseUrl}${cleanUrl}`;
  }
}