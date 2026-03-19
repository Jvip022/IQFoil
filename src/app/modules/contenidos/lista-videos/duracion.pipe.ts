import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duracion', standalone: true })
export class DuracionPipe implements PipeTransform {
  transform(segundos: number | undefined | null): string {
    if (!segundos || segundos <= 0) return '00:00';
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }
}