import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

import { ContenidoService, Video, Modulo } from '../../../core/services/contenido.service';
import { DocumentoService, Documento } from '../../../core/services/documento.service';
import { ComunidadService, Hilo } from '../../../core/services/comunidad.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

// Interfaces para los nuevos módulos
interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  nivel: string;
  imagenUrl: string;
  activo: boolean;
  fechaCreacion: Date;
}

interface Insignia {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: string;
  color: string;
  requisitos: string;
}

interface EventoAdmin {
  id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  tipo: string;
  organizador: string;
  contacto: string;
  activo: boolean;
}

@Component({
  selector: 'app-gestion-contenido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './gestion-contenido.component.html',
  styleUrls: ['./gestion-contenido.component.scss']
})
export class GestionContenidoComponent implements OnInit, OnDestroy {
  tabs = [
    { id: 'videos', nombre: 'Videos', icono: '🎥' },
    { id: 'documentos', nombre: 'Documentos', icono: '📄' },
    { id: 'foro', nombre: 'Foro (hilos)', icono: '💬' },
    { id: 'cursos', nombre: 'Cursos', icono: '📚' },
    { id: 'insignias', nombre: 'Insignias', icono: '🏅' },
    { id: 'eventos', nombre: 'Eventos', icono: '📅' }
  ];
  tabActivo = 'videos';

  // Propiedades para VIDEOS
  cargandoVideos = false;
  videos: Video[] = [];
  nuevoVideo = { titulo: '', descripcion: '', nivel: 'principiante', url: '' };
  archivoVideo: File | null = null;

  // Propiedades para DOCUMENTOS
  cargandoDocumentos = false;
  documentos: Documento[] = [];
  nuevoDocumento = { titulo: '', descripcion: '', tipo: 'pdf' };
  archivoDocumento: File | null = null;

  // Propiedades para FORO (HILOS)
  cargandoHilos = false;
  hilos: Hilo[] = [];

  // Propiedades para CURSOS
  cursos: Curso[] = [];
  cargandoCursos = false;
  modalCursoVisible = false;
  modoEdicionCurso = false;
  cursoActual: Partial<Curso> = { titulo: '', descripcion: '', nivel: 'principiante', activo: true };

  // Propiedades para INSIGNIAS
  insignias: Insignia[] = [];
  cargandoInsignias = false;
  modalInsigniaVisible = false;
  modoEdicionInsignia = false;
  insigniaActual: Partial<Insignia> = { nombre: '', descripcion: '', icono: '🏅', categoria: '', color: '#4aa3c2' };

  // Propiedades para EVENTOS
  eventos: EventoAdmin[] = [];
  cargandoEventos = false;
  modalEventoVisible = false;
  modoEdicionEvento = false;
  eventoActual: Partial<EventoAdmin> = { titulo: '', descripcion: '', lugar: '', tipo: 'entrenamiento', activo: true };

  // Modales de eliminación reutilizables
  modalEliminarVisible = false;
  elementoAEliminar: { tipo: string; id: string; nombre: string } | null = null;
  mensajeEliminar = '';

  private apiUrl = environment.apiUrl;
  private subscriptions: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private contenidoService: ContenidoService,
    private documentoService: DocumentoService,
    private comunidadService: ComunidadService,
    private notificacionService: NotificacionService
  ) { }

  ngOnInit(): void {
    this.cargarVideos();
    this.cargarDocumentos();
    this.cargarHilos();
    this.cargarCursos();
    this.cargarInsignias();
    this.cargarEventos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ==================== VIDEOS ====================
  cargarVideos(): void {
    this.cargandoVideos = true;
    this.contenidoService.getModulos().subscribe({
      next: (modulos: Modulo[]) => {
        this.videos = modulos.flatMap(m => m.videos);
        this.cargandoVideos = false;
      },
      error: () => {
        this.notificacionService.mostrarError('Error al cargar videos');
        this.cargandoVideos = false;
      }
    });
  }

  onVideoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoVideo = input.files[0];
    }
  }

  subirVideo(): void {
    if (!this.nuevoVideo.titulo || !this.archivoVideo) {
      this.notificacionService.mostrarAdvertencia('Título y archivo son obligatorios');
      return;
    }
    const formData = new FormData();
    formData.append('titulo', this.nuevoVideo.titulo);
    formData.append('descripcion', this.nuevoVideo.descripcion || '');
    formData.append('nivel', this.nuevoVideo.nivel);
    formData.append('duracion_segundos', '0');
    formData.append('archivo', this.archivoVideo);

    this.contenidoService.subirVideo(formData).subscribe({
      next: (nuevoVideo) => {
        this.videos.unshift(nuevoVideo);
        this.notificacionService.mostrarExito('Video subido correctamente');
        this.nuevoVideo = { titulo: '', descripcion: '', nivel: 'principiante', url: '' };
        this.archivoVideo = null;
      },
      error: (err) => {
        console.error('Error al subir video', err);
        this.notificacionService.mostrarError('Error al subir el video');
      }
    });
  }

  // ==================== DOCUMENTOS ====================
  cargarDocumentos(): void {
    this.cargandoDocumentos = true;
    this.documentoService.getDocumentos().subscribe({
      next: (docs: Documento[]) => {
        this.documentos = docs;
        this.cargandoDocumentos = false;
      },
      error: () => {
        this.notificacionService.mostrarError('Error al cargar documentos');
        this.cargandoDocumentos = false;
      }
    });
  }

  onDocumentoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoDocumento = input.files[0];
    }
  }

  subirDocumento(): void {
    if (!this.nuevoDocumento.titulo || !this.archivoDocumento) {
      this.notificacionService.mostrarAdvertencia('Título y archivo son obligatorios');
      return;
    }
    const formData = new FormData();
    formData.append('titulo', this.nuevoDocumento.titulo);
    formData.append('descripcion', this.nuevoDocumento.descripcion || '');
    formData.append('tipo', this.nuevoDocumento.tipo);
    formData.append('archivo', this.archivoDocumento);

    this.documentoService.subirDocumento(this.nuevoDocumento, this.archivoDocumento).subscribe({
      next: (nuevoDoc) => {
        this.documentos.unshift(nuevoDoc);
        this.notificacionService.mostrarExito('Documento subido correctamente');
        this.nuevoDocumento = { titulo: '', descripcion: '', tipo: 'pdf' };
        this.archivoDocumento = null;
      },
      error: (err) => {
        console.error('Error al subir documento', err);
        this.notificacionService.mostrarError('Error al subir el documento');
      }
    });
  }

  // ==================== FORO (HILOS) ====================
  cargarHilos(): void {
    this.cargandoHilos = true;
    this.comunidadService.getHilos().subscribe({
      next: (hilos: Hilo[]) => {
        this.hilos = hilos;
        this.cargandoHilos = false;
      },
      error: () => {
        this.notificacionService.mostrarError('Error al cargar hilos');
        this.cargandoHilos = false;
      }
    });
  }

  // ==================== CURSOS ====================
  cargarCursos(): void {
    this.cargandoCursos = true;
    this.http.get<Curso[]>(`${this.apiUrl}/cursos/`).subscribe({
      next: (data) => {
        this.cursos = data;
        this.cargandoCursos = false;
      },
      error: () => {
        this.notificacionService.mostrarError('Error al cargar cursos');
        this.cargandoCursos = false;
      }
    });
  }

  abrirModalCurso(): void {
    this.modoEdicionCurso = false;
    this.cursoActual = { titulo: '', descripcion: '', nivel: 'principiante', activo: true };
    this.modalCursoVisible = true;
  }

  editarCurso(curso: Curso): void {
    this.modoEdicionCurso = true;
    this.cursoActual = { ...curso };
    this.modalCursoVisible = true;
  }

  guardarCurso(): void {
    if (!this.cursoActual.titulo) {
      this.notificacionService.mostrarAdvertencia('El título es obligatorio');
      return;
    }
    const request = this.modoEdicionCurso
      ? this.http.put(`${this.apiUrl}/cursos/${this.cursoActual.id}`, this.cursoActual)
      : this.http.post(`${this.apiUrl}/cursos/`, this.cursoActual);
    request.subscribe({
      next: () => {
        this.notificacionService.mostrarExito(this.modoEdicionCurso ? 'Curso actualizado' : 'Curso creado');
        this.modalCursoVisible = false;
        this.cargarCursos();
      },
      error: () => this.notificacionService.mostrarError('Error al guardar curso')
    });
  }

  // ==================== INSIGNIAS ====================
  cargarInsignias(): void {
    this.cargandoInsignias = true;
    this.http.get<Insignia[]>(`${this.apiUrl}/insignias/`).subscribe({
      next: (data) => {
        this.insignias = data;
        this.cargandoInsignias = false;
      },
      error: () => {
        this.notificacionService.mostrarError('Error al cargar insignias');
        this.cargandoInsignias = false;
      }
    });
  }

  abrirModalInsignia(): void {
    this.modoEdicionInsignia = false;
    this.insigniaActual = { nombre: '', descripcion: '', icono: '🏅', categoria: '', color: '#4aa3c2' };
    this.modalInsigniaVisible = true;
  }

  editarInsignia(insignia: Insignia): void {
    this.modoEdicionInsignia = true;
    this.insigniaActual = { ...insignia };
    this.modalInsigniaVisible = true;
  }

  guardarInsignia(): void {
    if (!this.insigniaActual.nombre) {
      this.notificacionService.mostrarAdvertencia('El nombre es obligatorio');
      return;
    }
    const request = this.modoEdicionInsignia
      ? this.http.put(`${this.apiUrl}/insignias/${this.insigniaActual.id}`, this.insigniaActual)
      : this.http.post(`${this.apiUrl}/insignias/`, this.insigniaActual);
    request.subscribe({
      next: () => {
        this.notificacionService.mostrarExito(this.modoEdicionInsignia ? 'Insignia actualizada' : 'Insignia creada');
        this.modalInsigniaVisible = false;
        this.cargarInsignias();
      },
      error: () => this.notificacionService.mostrarError('Error al guardar insignia')
    });
  }

  // ==================== EVENTOS ====================
  cargarEventos(): void {
    this.cargandoEventos = true;
    this.http.get<EventoAdmin[]>(`${this.apiUrl}/eventos/`).subscribe({
      next: (data) => {
        this.eventos = data;
        this.cargandoEventos = false;
      },
      error: () => {
        this.notificacionService.mostrarError('Error al cargar eventos');
        this.cargandoEventos = false;
      }
    });
  }

  abrirModalEvento(): void {
    this.modoEdicionEvento = false;
    this.eventoActual = { titulo: '', descripcion: '', lugar: '', tipo: 'entrenamiento', activo: true };
    this.modalEventoVisible = true;
  }

  editarEvento(evento: EventoAdmin): void {
    this.modoEdicionEvento = true;
    this.eventoActual = { ...evento };
    this.modalEventoVisible = true;
  }

  guardarEvento(): void {
    if (!this.eventoActual.titulo || !this.eventoActual.fechaInicio) {
      this.notificacionService.mostrarAdvertencia('Título y fecha de inicio son obligatorios');
      return;
    }
    const request = this.modoEdicionEvento
      ? this.http.put(`${this.apiUrl}/eventos/${this.eventoActual.id}`, this.eventoActual)
      : this.http.post(`${this.apiUrl}/eventos/`, this.eventoActual);
    request.subscribe({
      next: () => {
        this.notificacionService.mostrarExito(this.modoEdicionEvento ? 'Evento actualizado' : 'Evento creado');
        this.modalEventoVisible = false;
        this.cargarEventos();
      },
      error: () => this.notificacionService.mostrarError('Error al guardar evento')
    });
  }

  // ==================== ELIMINACIÓN GENÉRICA ====================
    confirmarEliminar(tipo: string, id: string | number | undefined, nombre: string): void {
    if (!id) return;
    this.elementoAEliminar = { tipo, id: id.toString(), nombre };
    this.mensajeEliminar = `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`;
    this.modalEliminarVisible = true;
  }

  eliminarElemento(): void {
    if (!this.elementoAEliminar) return;
    const { tipo, id, nombre } = this.elementoAEliminar;
    let request = null;
    switch (tipo) {
      case 'curso': request = this.http.delete(`${this.apiUrl}/cursos/${id}`); break;
      case 'insignia': request = this.http.delete(`${this.apiUrl}/insignias/${id}`); break;
      case 'evento': request = this.http.delete(`${this.apiUrl}/eventos/${id}`); break;
      case 'video': request = this.contenidoService.eliminarVideo(id); break;
      case 'documento': request = this.documentoService.eliminarDocumento(id); break;
      case 'hilo': request = this.comunidadService.eliminarHilo(id); break;
    }
    if (request) {
      request.subscribe({
        next: () => {
          this.notificacionService.mostrarExito(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminado`);
          if (tipo === 'curso') this.cargarCursos();
          else if (tipo === 'insignia') this.cargarInsignias();
          else if (tipo === 'evento') this.cargarEventos();
          else if (tipo === 'video') this.cargarVideos();
          else if (tipo === 'documento') this.cargarDocumentos();
          else if (tipo === 'hilo') this.cargarHilos();
        },
        error: () => this.notificacionService.mostrarError(`Error al eliminar ${tipo}`)
      });
    }
    this.modalEliminarVisible = false;
    this.elementoAEliminar = null;
  }

  cancelarEliminar(): void {
    this.modalEliminarVisible = false;
    this.elementoAEliminar = null;
  }
}