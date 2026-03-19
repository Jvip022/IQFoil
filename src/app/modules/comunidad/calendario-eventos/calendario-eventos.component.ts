import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

// Servicios (simulados)
import { NotificacionService } from '../../../core/services/notificacion.service';

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: Date;
  lugar: string;
  tipo: 'regata' | 'entrenamiento' | 'reunion' | 'social';
  organizador?: string;
  contacto?: string;
}

@Component({
  selector: 'app-calendario-eventos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './calendario-eventos.component.html',
  styleUrls: ['./calendario-eventos.component.scss']
})
export class CalendarioEventosComponent implements OnInit {
  cargando = false;
  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];

  searchTerm = '';
  filtroTipo = '';
  filtroMes = '';

  eventoSeleccionado: Evento | null = null;

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.cargando = true;
    // Simular carga desde un servicio
    setTimeout(() => {
      this.eventos = [
        {
          id: '1',
          titulo: 'Regata de Primavera',
          descripcion: 'Competición oficial para las clases olímpicas.',
          fecha: new Date(2025, 3, 15, 10, 0),
          lugar: 'Club Náutico Barcelona',
          tipo: 'regata',
          organizador: 'Federación Catalana',
          contacto: 'info@fnb.cat'
        },
        {
          id: '2',
          titulo: 'Entrenamiento de foils',
          descripcion: 'Sesión práctica para mejorar técnica de foils.',
          fecha: new Date(2025, 3, 20, 16, 30),
          lugar: 'Puerto Olímpico',
          tipo: 'entrenamiento',
          organizador: 'Escuela de Vela'
        },
        {
          id: '3',
          titulo: 'Reunión de delegados',
          descripcion: 'Reunión trimestral con todos los representantes.',
          fecha: new Date(2025, 4, 5, 18, 0),
          lugar: 'Sede Federación',
          tipo: 'reunion'
        },
        {
          id: '4',
          titulo: 'Barbacoa social',
          descripcion: 'Evento social para confraternizar entre socios.',
          fecha: new Date(2025, 4, 10, 13, 0),
          lugar: 'Playa de la Barceloneta',
          tipo: 'social'
        },
        {
          id: '5',
          titulo: 'Regata nocturna',
          descripcion: 'Competición con luces y ambiente festivo.',
          fecha: new Date(2025, 5, 1, 21, 0),
          lugar: 'Bahía de Palma',
          tipo: 'regata'
        }
      ];
      this.filtrarEventos();
      this.cargando = false;
    }, 600);
  }

  filtrarEventos(): void {
    let filtrados = this.eventos;

    // Filtro por texto (título o descripción)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(e => 
        e.titulo.toLowerCase().includes(term) ||
        e.descripcion.toLowerCase().includes(term)
      );
    }

    // Filtro por tipo
    if (this.filtroTipo) {
      filtrados = filtrados.filter(e => e.tipo === this.filtroTipo);
    }

    // Filtro por mes (número de mes)
    if (this.filtroMes !== '') {
      const mes = parseInt(this.filtroMes, 10);
      filtrados = filtrados.filter(e => e.fecha.getMonth() === mes);
    }

    // Ordenar por fecha (próximos primero)
    filtrados.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    this.eventosFiltrados = filtrados;
  }

  verEvento(evento: Evento): void {
    this.eventoSeleccionado = evento;
  }

  cerrarDetalle(): void {
    this.eventoSeleccionado = null;
  }

  inscribirse(evento: Evento): void {
    this.notificacionService.mostrarExito(`Te has inscrito en "${evento.titulo}"`);
    this.cerrarDetalle();
  }
}