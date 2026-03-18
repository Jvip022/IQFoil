import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  /** Tamaño del spinner en píxeles (por defecto 40) */
  @Input() size = 40;

  /** Color del spinner (cualquier valor CSS válido, por defecto usa la variable --navy) */
  @Input() color?: string;

  /** Texto opcional que se muestra debajo del spinner */
  @Input() text?: string;

  /** Si es true, el spinner ocupa toda la pantalla con fondo semitransparente */
  @Input() fullscreen = false;
}