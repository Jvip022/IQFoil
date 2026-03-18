import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-confirmacion.component.html',
  styleUrls: ['./modal-confirmacion.component.scss']
})
export class ModalConfirmacionComponent {
  /** Controla la visibilidad del modal */
  @Input() isOpen = false;

  /** Título del modal */
  @Input() title = 'Confirmar acción';

  /** Mensaje de confirmación */
  @Input() message = '¿Estás seguro de que deseas continuar?';

  /** Texto del botón de confirmar */
  @Input() confirmText = 'Aceptar';

  /** Texto del botón de cancelar */
  @Input() cancelText = 'Cancelar';

  /** Ancho del modal (puede ser cualquier valor CSS, ej: '400px', '90%') */
  @Input() width = '450px';

  /** Si true, se cierra al hacer clic en el overlay */
  @Input() closeOnOverlayClick = true;

  /** Si true, se cierra al pulsar ESC */
  @Input() closeOnEscape = true;

  /** Emite cuando se confirma la acción */
  @Output() confirm = new EventEmitter<void>();

  /** Emite cuando se cancela o se cierra el modal */
  @Output() cancel = new EventEmitter<void>();

  /** Emite cuando el modal se cierra (tanto por confirm como por cancel) */
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen && this.closeOnEscape) {
      this.onCancel();
    }
  }

  onOverlayClick(event: MouseEvent): void {
    // Solo cerrar si el clic fue directamente en el overlay (no en el contenido)
    if (this.closeOnOverlayClick && (event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onCancel();
    }
  }

  onConfirm(): void {
    this.confirm.emit();
    this.closed.emit();
    this.isOpen = false;
  }

  onCancel(): void {
    this.cancel.emit();
    this.closed.emit();
    this.isOpen = false;
  }
}