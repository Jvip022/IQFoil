import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Servicios
import { NotificacionService } from '../../../core/services/notificacion.service';

// Componentes compartidos
import { EstadoConexionComponent } from '../../../shared/estado-conexion/estado-conexion.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ModalConfirmacionComponent } from '../../../shared/modal-confirmacion/modal-confirmacion.component';

export interface CategoriaGuia {
  id: string;
  nombre: string;
  icono: string;
}

export interface ItemGuia {
  id: string;
  categoria: string;
  titulo: string;
  descripcionCorta: string;
  descripcionLarga: string;
  imagenUrl: string;
  keywords?: string[];
  enlace?: string;
}

@Component({
  selector: 'app-guia-visual',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoConexionComponent,
    LoadingSpinnerComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './guia-visual.component.html',
  styleUrls: ['./guia-visual.component.scss']
})
export class GuiaVisualComponent implements OnInit {
  categorias: CategoriaGuia[] = [
    { id: 'reglas', nombre: 'Reglas', icono: '⚖️' },
    { id: 'nudos', nombre: 'Nudos', icono: '🪢' },
    { id: 'partes', nombre: 'Partes del barco', icono: '⛵' },
    { id: 'maniobras', nombre: 'Maniobras', icono: '🔄' },
    { id: 'seguridad', nombre: 'Seguridad', icono: '🦺' }
  ];

  categoriaActiva = 'reglas';
  searchTerm = '';
  cargando = false;

  private guiaMock: ItemGuia[] = [
    // Reglas
    {
      id: 'r1',
      categoria: 'reglas',
      titulo: 'Regla 10: Babor y Estribor',
      descripcionCorta: 'Prioridad de la embarcación por la derecha',
      descripcionLarga: 'Cuando dos embarcaciones se aproximan en rumbos opuestos, la que navega por babor (vela a la izquierda) se aparta de la que navega por estribor (vela a la derecha).',
      imagenUrl: '/assets/guia/regla10.jpg',
      keywords: ['babor', 'estribor', 'prioridad', 'cruce']
    },
    {
      id: 'r2',
      categoria: 'reglas',
      titulo: 'Regla 42: Propulsión',
      descripcionCorta: 'Prohibido el bombeo, mecido y movimiento del cuerpo',
      descripcionLarga: 'Está prohibido bombear la vela, mecer el barco o mover el cuerpo repetidamente para propulsar la embarcación. Solo se permite en condiciones de olas grandes para mantener el planeo.',
      imagenUrl: '/assets/guia/regla42.jpg',
      keywords: ['propulsión', 'bombeo', 'prohibido']
    },
    // Nudos
    {
      id: 'n1',
      categoria: 'nudos',
      titulo: 'Nudo de ocho',
      descripcionCorta: 'Nudo de tope para evitar que el cabo se salga',
      descripcionLarga: 'El nudo de ocho es un nudo de tope sencillo y seguro. Se usa al final de las escotas para que no se escapen de las poleas.',
      imagenUrl: '/assets/guia/nudo-ocho.jpg',
      keywords: ['ocho', 'tope', 'seguro']
    },
    {
      id: 'n2',
      categoria: 'nudos',
      titulo: 'Ballestrinque',
      descripcionCorta: 'Nudo rápido para atar un cabo a un poste',
      descripcionLarga: 'El ballestrinque es ideal para atar un cabo a un noray o a un mástil. Se hace con dos vueltas cruzadas y es fácil de desatar.',
      imagenUrl: '/assets/guia/ballestrinque.jpg',
      keywords: ['ballestrinque', 'atar', 'poste']
    },
    // Partes del barco
    {
      id: 'p1',
      categoria: 'partes',
      titulo: 'Mástil',
      descripcionCorta: 'Palo vertical que sostiene la vela',
      descripcionLarga: 'El mástil es el elemento vertical que sujeta la vela mayor y el foque. Puede ser de aluminio o carbono y se apoya en la quilla.',
      imagenUrl: '/assets/guia/mastil.jpg',
      keywords: ['mástil', 'palo', 'vela']
    },
    {
      id: 'p2',
      categoria: 'partes',
      titulo: 'Botavara',
      descripcionCorta: 'Palo horizontal en la base de la vela mayor',
      descripcionLarga: 'La botavara es el perfil horizontal que va desde el mástil hasta el puño de escota de la vela mayor. Permite controlar el ángulo de la vela.',
      imagenUrl: '/assets/guia/botavara.jpg',
      keywords: ['botavara', 'mayor', 'escota']
    },
    // Maniobras
    {
      id: 'm1',
      categoria: 'maniobras',
      titulo: 'Virada',
      descripcionCorta: 'Cambio de bordada pasando la proa por el viento',
      descripcionLarga: 'La virada consiste en cambiar de bordada (dirección) pasando la proa del barco a través del viento. Se utiliza para avanzar en zigzag contra el viento.',
      imagenUrl: '/assets/guia/virada.jpg',
      keywords: ['virada', 'bordada', 'cambio']
    },
    {
      id: 'm2',
      categoria: 'maniobras',
      titulo: 'Trasluchada',
      descripcionCorta: 'Cambio de bordada pasando la popa por el viento',
      descripcionLarga: 'La trasluchada es el cambio de bordada cuando el viento viene por la popa. Es una maniobra más rápida y debe controlarse la botavara.',
      imagenUrl: '/assets/guia/trasluchada.jpg',
      keywords: ['trasluchada', 'popa', 'cambio']
    },
    // Seguridad
    {
      id: 's1',
      categoria: 'seguridad',
      titulo: 'Chaleco salvavidas',
      descripcionCorta: 'Uso obligatorio en competición',
      descripcionLarga: 'El chaleco salvavidas debe estar homologado y llevarse correctamente ajustado. Proporciona flotación y protección contra hipotermia.',
      imagenUrl: '/assets/guia/chaleco.jpg',
      keywords: ['chaleco', 'salvavidas', 'flotación']
    }
  ];

  itemsFiltrados: ItemGuia[] = [];
  itemSeleccionado: ItemGuia | null = null;

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.cargarCategoria();
  }

  cambiarCategoria(categoriaId: string): void {
    this.categoriaActiva = categoriaId;
    this.searchTerm = '';
    this.cargarCategoria();
  }

  cargarCategoria(): void {
    this.cargando = true;
    setTimeout(() => {
      const items = this.guiaMock.filter(i => i.categoria === this.categoriaActiva);
      this.itemsFiltrados = items;
      this.cargando = false;
    }, 300);
  }

  filtrarItems(): void {
    const items = this.guiaMock.filter(i => i.categoria === this.categoriaActiva);
    if (!this.searchTerm.trim()) {
      this.itemsFiltrados = items;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.itemsFiltrados = items.filter(i =>
        i.titulo.toLowerCase().includes(term) ||
        i.descripcionCorta.toLowerCase().includes(term) ||
        i.descripcionLarga.toLowerCase().includes(term) ||
        i.keywords?.some(k => k.toLowerCase().includes(term))
      );
    }
  }

  seleccionarItem(item: ItemGuia): void {
    this.itemSeleccionado = item;
  }

  cerrarZoom(): void {
    this.itemSeleccionado = null;
  }
}