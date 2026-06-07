import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  getDocumentos(): Observable<Documento[]> {
    // Asegurar la barra final para evitar redirección 308
    return this.http.get<Documento[]>(`${this.apiUrl}/documentos/`);
  }

  subirDocumento(documento: Partial<Documento>, archivo: File): Observable<Documento> {
    const formData = new FormData();
    // Campos individuales como espera el backend
    formData.append('titulo', documento.titulo || '');
    formData.append('descripcion', documento.descripcion || '');
    formData.append('tipo', documento.tipo || 'pdf');
    formData.append('archivo', archivo);
    // No establecer Content-Type, el navegador lo hará automáticamente
    return this.http.post<Documento>(`${this.apiUrl}/documentos/`, formData);
  }

  eliminarDocumento(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documentos/${id}`);
  }

  actualizarDocumento(id: string, cambios: Partial<Documento>): Observable<Documento> {
    return this.http.put<Documento>(`${this.apiUrl}/documentos/${id}`, cambios);
  }
}